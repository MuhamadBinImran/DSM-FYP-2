const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Company = require("./models/Company");
const User = require("./models/User");
const nodemailer = require("nodemailer");
const OTP = require("./models/OTP");
const Job = require("./models/Job");
const Admin = require('./models/Admin');
const Course = require('./models/courses');
const { body, validationResult } = require("express-validator"); // Add this to use validation for user routes
const multer = require("multer");


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

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Middleware to check the token
const authenticate = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token part

  // If no token is provided, return a 403 response
  if (!token) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  // Verify the token using the secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = decoded; // Attach decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // If verification fails, return a 403 response with an "Invalid token" message
    return res.status(403).json({ message: "Invalid token." });
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
    const user = await Company.findOne({ email });
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
      { email: user.email, companyName: user.companyName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      companyName: user.companyName,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "An error occurred. Please try again." });
  }
});

// Post Job Route
app.post("/api/company/post-job", async (req, res) => {
  const { jobTitle, jobDescription, companyEmail, companyName } = req.body;

  try {
    // Validate email format
    if (!companyEmail || !/\S+@\S+\.\S+/.test(companyEmail)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    // Validate companyName
    if (!companyName || companyName.trim() === "") {
      return res.status(400).json({ message: "Company name is required." });
    }

    // Create a new job document
    const newJob = new Job({
      jobTitle,
      jobDescription,
      companyEmail,
      companyName, // Include companyName field
    });

    // Save the job to the database
    await newJob.save();

    // Send confirmation email to the company
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: companyEmail,
      subject: "Job Posting Confirmation",
      text: `Your job titled "${jobTitle}" at "${companyName}" has been successfully posted!`,
    });

    // Send success response
    res.status(200).json({
      message: "Job posted successfully! A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error posting job:", error);
    res.status(500).json({ message: "Server error while posting job." });
  }
});

// Get All Jobs
app.get("/api/company/get-jobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error while fetching jobs." });
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
      { email: company.email, name: company.name },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      name: company.name,
    });
  } catch (error) {
    console.error("Google Login Error:", error.message || error);
    res.status(500).json({ message: "Google Login failed. Please try again." });
  }
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

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const admin = await Admin.findOne({ email: normalizedEmail });

    console.log("🟢 Email provided:", normalizedEmail);
    console.log("🟢 Admin found in DB?:", admin ? "Yes" : "No");

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("🟢 Password match?:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: "Login successful" });

  } catch (error) {
    console.error("🚨 Server error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});


// --------------------------------------------COURSE MANAGEMENT----------------------------------------------

// Multer Storage for File Uploads (Thumbnails)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

//  API to Upload a Course (With Course Link Support)
app.post('/api/courses', upload.single('thumbnail'), async (req, res) => {
  try {
    const { title, description, category, duration, courseLink } = req.body;
    const thumbnail = req.file ? req.file.filename : ''; // Store file name

    const newCourse = new Course({ title, description, category, duration, thumbnail, courseLink });
    await newCourse.save();
    res.status(201).json({ message: 'Course uploaded successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Error uploading course' });
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
    const { title, description, category, duration, courseLink } = req.body;
    const thumbnail = req.file ? req.file.filename : req.body.thumbnail;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, category, duration, thumbnail, courseLink },
      { new: true }
    );

    res.json({ message: 'Course updated successfully', updatedCourse });

  } catch (error) {
    res.status(500).json({ error: 'Error updating course' });
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
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching jobs" });
  }
});

// ✅ API to Delete a Job by ID
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting job" });
  }
});


// Listen
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
