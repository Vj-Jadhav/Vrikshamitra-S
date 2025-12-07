import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import { Institute } from "../models/BaseInstituteSchema.js";
import Admin from "../models/AdminSchema.js"; // or whatever Admin model is used

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token exist
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { role, id } = decoded;

    console.log("Auth Middleware Decoded:", { role, id });

    let user;

    // Find user based on role
    switch (role) {
      case "student":
        user = await Student.findById(id).select("-password");
        break;
      case "faculty":
        user = await Faculty.findById(id).select("-password");
        break;
      case "institute":
        user = await Institute.findById(id).select("-password");
        break;
      case "admin":
        user = await Admin.findById(id).select("-password");
        break;
      default:
        console.log("Auth Middleware: Invalid role", role);
        return res.status(401).json({ message: `Invalid role in token: ${role}` });
    }

    if (!user) {
      console.log(`Auth Middleware: ${role} not found with ID ${id}`);
      return res.status(404).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
    }

    // Attach user and role to request
    req.user = user;
    req.userRole = role; // Optional: helpful context

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};
