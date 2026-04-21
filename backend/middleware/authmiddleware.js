import jwt from 'jsonwebtoken'

export const protect = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({message: "Unauthorised"});
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        req.user = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        res.status(401).json({message:"Invalid or expired token"})
    }
}
export const adminOnly = (req, res, next) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};