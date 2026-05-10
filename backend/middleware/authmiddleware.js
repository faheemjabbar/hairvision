import jwt from 'jsonwebtoken'

/**
 * In-memory token blocklist (for development only)
 * In production, use Redis for persistence across server restarts
 */
const tokenBlocklist = new Set();

/**
 * Protect middleware - validates JWT and checks blocklist
 */
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const token = authHeader.split(" ")[1];

        // Check if token is revoked
        if (tokenBlocklist.has(token)) {
            return res.status(401).json({ message: "Token has been revoked. Please login again." });
        }

        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.user = decoded.userId;
        req.userRole = decoded.role;
        req.token = token; // Store token for logout
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        return res.status(401).json({ message: "Invalid token" });
    }
};

/**
 * Admin-only middleware
 */
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
    }

    if (req.userRole !== "admin") {
        return res.status(403).json({ message: "Admin privileges required" });
    }

    next();
};

/**
 * Logout - add token to blocklist
 * Called by logout route
 */
export const revokeToken = (token) => {
    tokenBlocklist.add(token);
    
    // Optional: set expiry timer to remove from blocklist after token expires
    // This prevents memory leak in long-running servers
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
        const expiryMs = (decoded.exp * 1000) - Date.now();
        if (expiryMs > 0) {
            setTimeout(() => {
                tokenBlocklist.delete(token);
            }, expiryMs);
        }
    }
};

/**
 * Get blocklist size (for debugging)
 */
export const getBlocklistSize = () => tokenBlocklist.size;