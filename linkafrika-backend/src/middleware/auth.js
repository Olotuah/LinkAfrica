import jwt from "jsonwebtoken";
import User from "../../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Token is no longer valid.",
      });
    }

    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token has expired. Please login again.",
      });
    }

    console.error("Auth middleware error:", error);

    return res.status(401).json({
      error: "Invalid token.",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user) {
      req.userId = user._id;
      req.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};
