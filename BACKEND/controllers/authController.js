const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register a new user
exports.register = async (req, res) => {
  
  try {
    const { username, email, password, role } = req.body;

    // Ensure email is always lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "user", // Default to 'user' if role is not provided
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};


// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email); // Debugging

    // Convert email to lowercase for comparison
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log("User not found for email:", normalizedEmail);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for email:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful for email:", normalizedEmail);
    res.status(200).json({ message: "Login successful", token, role: user.role });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get current user details
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res
      .status(500)
      .json({ message: "Error fetching user details", error: error.message });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log("Token from request:", token); // Log the token

    if (!token) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded); // Log the decoded token

    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    console.error("Error in protect middleware:", error); // Log the error
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to restrict access based on roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action" });
    }
    next();
  };
};
