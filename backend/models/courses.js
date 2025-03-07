const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: String, required: true },
    thumbnail: { type: String }, // Stores image filename or URL
    courseLink: { type: String, required: true } // Stores the link to the course (e.g., YouTube, Udemy, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
