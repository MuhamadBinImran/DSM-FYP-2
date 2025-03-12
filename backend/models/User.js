const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  skills: [{ type: String }],
  bio: { type: String, default: "" },
  education: [{
    institution: String,
    degree: String,
    field: String,
    graduationYear: Number
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String
  }],
  tasks: [{
    title: String,
    description: String,
    deadline: Date,
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started'
    }
  }],
  learningPaths: [{
    course: String,
    provider: String,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
