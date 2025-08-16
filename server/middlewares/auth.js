const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

// Auth Middleware to check if token is valid and decode it
exports.auth = async (req, res, next) => {
  try {
    console.log("BEFORE TOKEN EXTRACTION");

    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    console.log("AFTER TOKEN EXTRACTION");

    //if token missing, then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decode);
      req.user = decode; // used later in Profile Controller and other middlewares
      next();
    } catch (error) {
      //verification - issue
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired. Please login again.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// Middleware for checking Student access
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// Middleware for checking Instructor access
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};

// Middleware for checking Admin access
exports.isAdmin = async (req, res, next) => {
  try {
    console.log("Printing AccountType ", req.user.accountType);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, please try again",
    });
  }
};
