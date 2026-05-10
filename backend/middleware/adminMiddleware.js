/**
 * Admin-only middleware
 * Checks if user has admin role
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
 * Optional admin check (allows access but marks if admin)
 * Useful for endpoints that show different data based on role
 */
export const isAdmin = (req, res, next) => {
  req.isAdmin = req.userRole === "admin";
  next();
};