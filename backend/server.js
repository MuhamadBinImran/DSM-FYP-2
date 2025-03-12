const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const Company = require("./models/Company");
const User = require("./models/User");
const nodemailer = require("nodemailer");
const OTP = require("./models/OTP");
const Job = require("./models/Job");
const Admin = require('./models/Admin');
const Course = require('./models/courses');
const { body, validationResult } = require("express-validator"); // Add this to use validation for user routes
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Update this if using another email service
  auth: {
    user: process.env.EMAIL, // Sender's email
    pass: process.env.EMAIL_PASSWORD, // Sender's password
  },
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Apply rate limiting to all routes
app.use(limiter);

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/DMS',
    ttl: 24 * 60 * 60 // Session TTL (1 day)
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
};

// Apply session middleware
app.use(session(sessionConfig));

// CORS configuration with credentials
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Increase preflight cache to 10 minutes
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(bodyParser.json());

// Middleware to check the token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided. Please log in again.' });
    }

    // Verify token and decode user information
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add timestamp verification
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }

    // Store decoded user info in request object
    req.user = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token. Please log in again.' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    } else {
      return res.status(401).json({ message: 'Authentication error. Please log in again.' });
    }
  }
};

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
const profilePicturesDir = path.join(uploadDir, 'profile-pictures');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profilePicturesDir)) {
  fs.mkdirSync(profilePicturesDir);
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
// Register Company with OTP
app.post('/api/company/register', async (req, res) => {
  const { email } = req.body;

  try {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Your OTP for Company Registration',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to email. Please verify to complete registration.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Verify OTP and Register Company
app.post("/api/company/verify-otp", async (req, res) => {
  const { email, otp, companyName, password, address } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newCompany = new Company({
      companyName,
      email,
      password: hashedPassword,
      address,
    });

    await newCompany.save();
    await OTP.deleteOne({ email });

    res
      .status(200)
      .json({ message: "Email verified and company registered successfully!" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Login Company
app.post("/api/company/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res
        .status(400)
        .json({ message: "Invalid Email. User not found." });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = jwt.sign(
      { 
        id: company._id,
        email: company.email, 
        companyName: company.companyName,
        role: 'company'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      companyName: company.companyName,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Server error while logging in." });
  }
});

// Post Job Route
app.post("/api/jobs", verifyToken, async (req, res) => {
  try {
    const { jobTitle, jobDescription, companyEmail, companyName, skills, expiryDate } = req.body;
    
    // Validate required fields
    if (!jobTitle || !jobDescription || !companyEmail || !companyName || !skills || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate skills array
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: "At least one skill is required" });
    }
    
    // Validate expiry date
    const today = new Date();
    const expiry = new Date(expiryDate);
    if (expiry <= today) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }
    
    // Get company ID from token
    const companyId = req.user.id;
    
    // Create a new job
    const newJob = new Job({
      jobTitle,
      jobDescription,
      companyEmail,
      companyName,
      skills,
      expiryDate: expiry,
      company: companyId,
      status: 'active',
      verified: false
    });
    
    // Save the job to the database
    const savedJob = await newJob.save();
    
    res.status(201).json({
      message: "Job posted successfully",
      job: savedJob
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the get jobs route for companies
app.get("/api/company/get-jobs", verifyToken, async (req, res) => {
  try {
    // Check if user is a company
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Unauthorized. Company access required." });
    }
    
    // Get company ID from token
    const companyId = req.user.id;
    
    // Find all jobs associated with this company
    const jobs = await Job.find({ company: companyId })
      .sort({ createdAt: -1 })
      .populate('applicants', 'name email'); // Populate basic applicant info
    
    if (!jobs) {
      return res.status(404).json({ message: "No jobs found for this company" });
    }
    
    res.status(200).json({
      message: "Jobs retrieved successfully",
      jobs: jobs
    });
  } catch (error) {
    console.error("Error retrieving company jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password - Generate OTP and Send Email
app.post("/api/company/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Reset Password - Using OTP to reset password
app.post("/api/company/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update the company's password
    await Company.updateOne({ email }, { $set: { password: hashedPassword } });

    // Delete OTP after password reset
    await OTP.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

// ** Users API **

// ** User Registration - Generate OTP **
app.post(
  "/api/user/register",
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered." });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await OTP.findOneAndUpdate(
        { email },
        { otp, expiresAt },
        { upsert: true, new: true }
      );

      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your OTP for Registration",
        text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
      });

      res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Server error." });
    }
  }
);

app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid Email. User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password." });
    }

    const token = jwt.sign(
      { email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(200)
      .json({ message: "Login successful", token, name: user.name });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// ** Verify OTP and Create User **
app.post("/api/user/verify-otp", async (req, res) => {
  const { email, otp, name, password } = req.body;

  console.log("Request received:", req.body); // Log request payload for debugging

  // Validate required fields
  if (!email || !otp || !name || !password) {
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!otp) missingFields.push("otp");
    if (!name) missingFields.push("name");
    if (!password) missingFields.push("password");

    return res.status(400).json({
      message: `Missing required fields: ${missingFields.join(", ")}.`,
    });
  }

  try {
    // Find OTP entry in the database for the provided email
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    // Check if OTP has expired
    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Check if OTP matches
    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    // Hash the user's password asynchronously (better for performance)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with the provided details
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database
    await newUser.save();

    // Delete the OTP entry after successful registration
    await OTP.deleteOne({ email });

    // Send response after successful user registration
    res
      .status(200)
      .json({ message: "Email verified and user registered successfully!" });
  } catch (error) {
    // Log error for debugging purposes
    console.error("Error during OTP verification:", error.message);

    // Send generic error message to user to prevent leakage of sensitive information
    res
      .status(500)
      .json({ message: "An error occurred during OTP verification." });
  }
});

// ** Google Login API **
app.post("/api/company/google-login", async (req, res) => {
  // This route requires google-auth-library which is not installed
  // To use this route, install the library with: npm install google-auth-library
  return res.status(501).json({ 
    message: "Google login is currently unavailable. Please use email/password login." 
  });
  
  /* Original implementation:
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token not provided." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Payload:", payload);

    const { email, name } = payload;

    let company = await Company.findOne({ email });
    if (!company) {
      company = await Company.create({ email, name });
    }

    const jwtToken = jwt.sign(
      { 
        id: company._id,
        email: company.email, 
        companyName: company.companyName || name,
        role: 'company'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      name: company.name || company.companyName,
    });
  } catch (error) {
    console.error("Google Login Error:", error.message || error);
    res.status(500).json({ message: "Google Login failed. Please try again." });
  }
  */
});

// Get All Users API
app.get("/api/user/get-all-users", async (req, res) => {
  try {
    // Fetch all users from the User collection
    const users = await User.find();

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Return the list of users
    res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users." });
  }
});

// Get Company Stats (e.g., number of jobs posted and available users)
app.get("/api/company/stats", async (req, res) => {
  try {
    // Get the total number of jobs posted by the company
    const jobCount = await Job.countDocuments();

    // Get the total number of registered users (not specific to a company)
    const userCount = await User.countDocuments(); // Count of all users in the system

    // You can also add other statistics here if needed (e.g., active job postings, etc.)
    const stats = {
      jobCount,
      userCount,
      // Add any additional metrics you'd like here
    };

    res
      .status(200)
      .json({ message: "Company stats fetched successfully.", stats });
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching company stats." });
  }
});

// Send job offer email
app.post("/api/send-job-offer", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email address is required." });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Job Offer from Our Company",
    text: "We are pleased to offer you a job at our company. Please get in touch for further details.",
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, message: "Error sending email." });
  }
});

// Forgot Password - Generate OTP and Send Email
app.post("/api/user/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Reset Password - Using OTP to Reset Password
app.post("/api/user/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpEntry = await OTP.findOne({ email });

    if (!otpEntry) {
      return res.status(400).json({ message: "No OTP found for this email." });
    }

    if (new Date() > otpEntry.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    if (otpEntry.otp !== otp) {
      return res.status(400).json({ message: "Incorrect OTP." });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update the user's password
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    // Delete OTP after password reset
    await OTP.deleteOne({ email });

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

//--------------------------------------------ADMIN----------------------------------------------

// backend/server.js

// Admin session check middleware
const checkAdminSession = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  
  if (!req.session || !req.session.adminId) {
    return res.status(401).json({ message: 'Session expired: Please login again' });
  }

  if (!token) {
    return res.status(401).json({ message: 'No token: Please login again' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.adminId !== req.session.adminId.toString()) {
      return res.status(401).json({ message: 'Invalid session: Please login again' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token: Please login again' });
  }
};

// Modified Admin Login Route
app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set admin session
    req.session.adminId = admin._id;
    req.session.adminEmail = admin.email;

    // Generate JWT token with adminId to distinguish admin role
    const token = jwt.sign(
      { 
        adminId: admin._id,
        email: admin.email,
        role: 'admin'  // Explicitly set role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie for extra security
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.status(200).json({ 
      message: "Login successful",
      token,
      admin: {
        email: admin.email,
        id: admin._id,
        role: 'admin'  // Include role in response
      }
    });

  } catch (error) {
    console.error("🚨 Server error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Admin logout route
app.post('/api/admin/logout', verifyToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }
    
    // Clear admin session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Error during logout" });
        }
      });
    }
    
    // Clear cookie
    res.clearCookie('adminToken');
    
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during admin logout:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
});

// Protect admin routes with session check
app.get('/api/admin/check-auth', checkAdminSession, (req, res) => {
  res.json({ 
    isAuthenticated: true, 
    admin: {
      email: req.session.adminEmail,
      id: req.session.adminId
    }
  });
});

// Apply session check to all admin routes
app.use('/api/courses', checkAdminSession);
app.use('/api/users', checkAdminSession);
app.use('/api/jobs', checkAdminSession);

// --------------------------------------------COURSE MANAGEMENT----------------------------------------------

//  API to Upload a Course (With Course Link Support)
app.post('/api/courses', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, category, duration, courseLink, youtubeUrl, skills } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !duration) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    
    // Parse skills from JSON string to array
    let parsedSkills = [];
    try {
      parsedSkills = skills ? JSON.parse(skills) : [];
    } catch (error) {
      return res.status(400).json({ message: "Invalid skills format" });
    }
    
    if (!parsedSkills.length) {
      return res.status(400).json({ message: "At least one skill is required" });
    }

    // Create a new course
    const newCourse = new Course({
      title,
      description,
      category,
      duration,
      courseLink: courseLink || "",
      youtubeUrl: youtubeUrl || "",
      thumbnail: req.file ? `/uploads/${req.file.filename}` : null,
      skills: parsedSkills
    });

    // Save the course to the database
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error while creating course" });
  }
});

//  API to Fetch All Courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching courses' });
  }
});

//  API to Delete a Course
app.delete('/api/courses/:id', async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting course' });
  }
});

//  API to Update a Course
app.put('/api/courses/:id', upload.single('thumbnail'), async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, description, category, duration, courseLink, youtubeUrl, skills } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !duration) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
    
    // Parse skills from JSON string to array
    let parsedSkills = [];
    try {
      parsedSkills = skills ? JSON.parse(skills) : [];
    } catch (error) {
      return res.status(400).json({ message: "Invalid skills format" });
    }
    
    if (!parsedSkills.length) {
      return res.status(400).json({ message: "At least one skill is required" });
    }

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Update course fields
    course.title = title;
    course.description = description;
    course.category = category;
    course.duration = duration;
    course.courseLink = courseLink || "";
    course.youtubeUrl = youtubeUrl || "";
    course.skills = parsedSkills;

    // Update thumbnail if a new file is uploaded
    if (req.file) {
      course.thumbnail = `/uploads/${req.file.filename}`;
    }

    // Save the updated course
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: "Server error while updating course" });
  }
});

// --------------------------------------------User MANAGEMENT----------------------------------------------

//  API to Fetch All Users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

//  API to Delete a User by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// --------------------------------------------JOB MANAGEMENT----------------------------------------------

// ✅ API to Fetch All Jobs
app.get("/api/jobs", async (req, res) => {
  try {
    // Find all verified and active jobs
    const jobs = await Job.find({ 
      verified: true,
      status: 'active',
      expiryDate: { $gt: new Date() } // Only return jobs that haven't expired
    })
    .sort({ createdAt: -1 })
    .populate('company', 'name logo website industry'); // Populate company details
    
    res.status(200).json({
      message: "Jobs retrieved successfully",
      jobs: jobs
    });
  } catch (error) {
    console.error("Error retrieving jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ API to Fetch All Jobs for Admin (including unverified and inactive)
app.get("/api/admin/jobs", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    // Find all jobs regardless of status
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .populate('company', 'name logo website industry'); // Populate company details
    
    res.status(200).json({
      message: "All jobs retrieved successfully",
      jobs: jobs
    });
  } catch (error) {
    console.error("Error retrieving jobs for admin:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ API to Delete a Job by ID
app.delete("/api/jobs/:id", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ error: "Error deleting job" });
  }
});

// ✅ API to Update a Job's Status
app.put("/api/jobs/:id", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    
    const { status } = req.body;
    
    if (!status || !['active', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ 
      message: "Job status updated successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ error: "Error updating job status" });
  }
});

// Get user profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio, skills, education, experience, certifications } = req.body;
    
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (education) user.education = education;
    if (experience) user.experience = experience;
    if (certifications) user.certifications = certifications;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get user tasks
app.get('/api/user/tasks', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Update task status
app.put('/api/user/tasks/:taskId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const task = user.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await user.save();
    
    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Get user learning paths
app.get('/api/user/learning-paths', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.learningPaths);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching learning paths' });
  }
});

// Update learning path progress
app.put('/api/user/learning-paths/:pathId', verifyToken, async (req, res) => {
  try {
    const { progress } = req.body;
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const learningPath = user.learningPaths.id(req.params.pathId);
    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    learningPath.progress = progress;
    await user.save();
    
    res.json({ message: 'Progress updated successfully', learningPath });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress' });
  }
});

// Update profile picture
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile-pictures'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadProfilePicture = multer({ 
  storage: profilePictureStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

app.post('/api/user/profile-picture', verifyToken, uploadProfilePicture.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update profile picture path
    user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
    await user.save();

    res.json({ message: 'Profile picture updated successfully', profilePicture: user.profilePicture });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture' });
  }
});

// Gemini API proxy endpoint
app.post('/api/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found in environment variables');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    console.log('Sending request to Gemini API with message:', message);
    console.log('Using API key:', apiKey.substring(0, 5) + '...');

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [{
          parts: [{ text: message }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          key: apiKey
        }
      }
    );

    console.log('Gemini API response received');
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    // Handle both Gemini 1.0 and 2.0 response formats
    if (
      (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) && 
      (!response.data?.contents?.[0]?.parts?.[0]?.text)
    ) {
      console.error('Invalid response structure from Gemini API:', response.data);
      throw new Error('Invalid response from Gemini API');
    }

    // Return the response as is to let the frontend handle the structure
    res.json(response.data);
  } catch (error) {
    console.error('Chatbot error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({ error: 'Invalid API key or authentication error' });
    }
    
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later' });
    }

    res.status(500).json({
      error: 'Error communicating with AI service',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Verify a job
app.put("/api/jobs/:id/verify", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const { verified } = req.body;

    // Find the job and update its verification status
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { verified: verified },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error("Error verifying job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin route to verify a job
app.put("/api/admin/verify-job/:jobId", verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }
    
    const jobId = req.params.jobId;
    const { verified } = req.body;
    
    // Find and update the job
    const job = await Job.findByIdAndUpdate(
      jobId, 
      { verified: verified !== undefined ? verified : true }, 
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Send notification to the company that posted the job (in a real app)
    // This would typically involve sending an email or in-app notification
    
    res.status(200).json({
      message: `Job ${verified ? 'verified' : 'unverified'} successfully`,
      job: job
    });
  } catch (error) {
    console.error("Error verifying job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// User route to apply for a job
app.post("/api/jobs/:jobId/apply", verifyToken, async (req, res) => {
  try {
    // Check if user is a regular user (not company or admin)
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: "Only users can apply for jobs" });
    }
    
    const jobId = req.params.jobId;
    const userId = req.user.id;
    
    // Find the job
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    // Check if job is verified and active
    if (!job.verified || job.status !== 'active') {
      return res.status(400).json({ message: "This job is not available for applications" });
    }
    
    // Check if job has expired
    if (new Date(job.expiryDate) < new Date()) {
      return res.status(400).json({ message: "This job posting has expired" });
    }
    
    // Check if user has already applied
    if (job.applicants.includes(userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    
    // Add user to applicants array
    job.applicants.push(userId);
    await job.save();
    
    res.status(200).json({
      message: "Application submitted successfully",
      job: job
    });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Company route to view applicants for a job
app.get("/api/company/jobs/:jobId/applicants", verifyToken, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const companyId = req.user.id;
    
    // Find the job and check if it belongs to the company
    const job = await Job.findOne({ _id: jobId, company: companyId });
    
    if (!job) {
      return res.status(404).json({ message: "Job not found or you don't have permission to view it" });
    }
    
    // Populate the applicants field with user details
    const populatedJob = await Job.findById(jobId).populate({
      path: 'applicants',
      select: 'name email profilePicture skills education experience' // Select only necessary fields
    });
    
    res.status(200).json({
      message: "Applicants retrieved successfully",
      applicants: populatedJob.applicants
    });
  } catch (error) {
    console.error("Error retrieving applicants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get company profile
app.get("/api/company/profile", verifyToken, async (req, res) => {
  try {
    // Check if user is a company
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Unauthorized. Company access required." });
    }
    
    // Get company ID from token
    const companyId = req.user.id;
    
    // Find company by ID
    const company = await Company.findById(companyId).select('-password');
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Return company data directly for easier frontend consumption
    res.status(200).json(company);
  } catch (error) {
    console.error("Error retrieving company profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update company profile
app.put("/api/company/update-profile", verifyToken, upload.single('logo'), async (req, res) => {
  try {
    // Check if user is a company
    if (req.user.role !== 'company') {
      return res.status(403).json({ message: "Unauthorized. Company access required." });
    }
    
    // Get company ID from token
    const companyId = req.user.id;
    
    // Find company by ID
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    // Update fields
    const updateFields = [
      'name', 'email', 'website', 'phoneNumber', 'location', 
      'industry', 'size', 'foundedYear', 'description'
    ];
    
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });
    
    // If name is updated, also update companyName for consistency
    if (req.body.name) {
      company.companyName = req.body.name;
    }
    
    // Handle social media fields
    if (req.body['socialMedia[linkedin]'] || 
        req.body['socialMedia[twitter]'] || 
        req.body['socialMedia[facebook]'] || 
        req.body['socialMedia[instagram]']) {
      
      company.socialMedia = {
        linkedin: req.body['socialMedia[linkedin]'] || company.socialMedia?.linkedin || '',
        twitter: req.body['socialMedia[twitter]'] || company.socialMedia?.twitter || '',
        facebook: req.body['socialMedia[facebook]'] || company.socialMedia?.facebook || '',
        instagram: req.body['socialMedia[instagram]'] || company.socialMedia?.instagram || ''
      };
    }
    
    // Handle logo upload
    if (req.file) {
      // If there's an existing logo, delete it
      if (company.logo) {
        const oldLogoPath = path.join(__dirname, company.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      // Save the new logo path
      company.logo = req.file.path.replace(/\\/g, '/').replace('backend/', '');
    }
    
    // Save the updated company
    await company.save();
    
    // Return the updated company
    res.status(200).json({
      success: true,
      message: "Company profile updated successfully",
      company
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating profile" 
    });
  }
});

// Admin route to get all companies
app.get("/api/admin/companies", verifyToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized. Admin access required." 
      });
    }
    
    // Fetch all companies
    const companies = await Company.find().select('-password');
    
    res.status(200).json({
      success: true,
      companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching companies" 
    });
  }
});

// Admin check authentication route
app.get('/api/admin/check-auth', verifyToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        isAuthenticated: false,
        message: "Unauthorized. Admin access required." 
      });
    }
    
    // Get admin ID from token
    const adminId = req.user.adminId;
    
    // Find admin by ID
    const admin = await Admin.findById(adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({ 
        isAuthenticated: false,
        message: "Admin not found" 
      });
    }
    
    res.status(200).json({
      isAuthenticated: true,
      admin: {
        id: admin._id,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error("Error checking admin authentication:", error);
    res.status(500).json({ 
      isAuthenticated: false,
      message: "Server error while checking authentication" 
    });
  }
});

// Admin dashboard stats route
app.get('/api/admin/dashboard/stats', verifyToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }
    
    // Get counts from different collections
    const usersCount = await User.countDocuments();
    const jobsCount = await Job.countDocuments();
    const coursesCount = await Course.countDocuments();
    
    // For now, we don't have an assessments collection, so we'll use 0
    const assessmentsCount = 0;
    
    res.status(200).json({
      users: usersCount,
      jobs: jobsCount,
      assessments: assessmentsCount,
      courses: coursesCount
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    res.status(500).json({ message: "Server error while fetching dashboard stats" });
  }
});

// Admin dashboard activity route
app.get('/api/admin/dashboard/activity', verifyToken, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized. Admin access required." });
    }
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('name email createdAt');
    
    // Get recent jobs
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('jobTitle companyName createdAt');
    
    // Format the activity data
    const activity = [
      ...recentUsers.map(user => ({
        type: 'user',
        action: 'New User Registration',
        description: `${user.name || user.email} has registered on the platform`,
        time: formatDate(user.createdAt)
      })),
      ...recentJobs.map(job => ({
        type: 'job',
        action: 'Job Posted',
        description: `A new job "${job.jobTitle}" has been posted by ${job.companyName}`,
        time: formatDate(job.createdAt)
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    
    res.status(200).json(activity);
  } catch (error) {
    console.error("Error fetching admin dashboard activity:", error);
    res.status(500).json({ message: "Server error while fetching dashboard activity" });
  }
});

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  } else {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

// Get available jobs for users
app.get("/api/user/available-jobs", verifyToken, async (req, res) => {
  try {
    const jobs = await Job.find({
      status: { $in: ['active', 'draft'] },
      expiryDate: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .populate('company', 'companyName location');

    res.json({ success: true, jobs });
  } catch (error) {
    console.error("Error fetching available jobs:", error);
    res.status(500).json({ success: false, message: "Error fetching jobs", error: error.message });
  }
});

// Listen
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

// Rate Limiting Middleware
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

// Apply rate limiting to auth routes
app.use('/api/user/login', loginLimiter);
app.use('/api/admin/login', loginLimiter);

// Serve static files with caching
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
