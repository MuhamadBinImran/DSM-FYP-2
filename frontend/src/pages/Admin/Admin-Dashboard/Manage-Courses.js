import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Manage-Courses.css"; // Import Corrected CSS File

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        duration: "",
        thumbnail: null,
        courseLink: "",
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    // Fetch Courses from Backend
    const fetchCourses = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/courses");
            setCourses(response.data);
        } catch (error) {
            console.error("Error fetching courses:", error);
        }
    };

    // Handle Input Change
    const handleChange = (e) => {
        if (e.target.name === "thumbnail") {
            setFormData({ ...formData, thumbnail: e.target.files[0] });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // Handle Course Upload
    const handleUpload = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("duration", formData.duration);
        data.append("courseLink", formData.courseLink);
        data.append("thumbnail", formData.thumbnail);

        try {
            await axios.post("http://localhost:5000/api/courses", data);
            fetchCourses();
            setFormData({ title: "", description: "", category: "", duration: "", courseLink: "", thumbnail: null });
        } catch (error) {
            console.error("Error uploading course:", error);
        }
    };

    // Handle Course Deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                await axios.delete(`http://localhost:5000/api/courses/${id}`);
                fetchCourses();
            } catch (error) {
                console.error("Error deleting course:", error);
            }
        }
    };

    return (
        <div className="manage-courses-container">
            <h2>Manage Courses</h2>

            {/* Upload Course Form */}
            <div className="form-section">
                <h3>Add New Course</h3>
                <form className="course-form" onSubmit={handleUpload}>
                    <input type="text" name="title" placeholder="Course Title" value={formData.title} onChange={handleChange} required />
                    <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
                    <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
                    <input type="text" name="duration" placeholder="Duration" value={formData.duration} onChange={handleChange} required />
                    <input type="text" name="courseLink" placeholder="Course Link (YouTube, Udemy, etc.)" value={formData.courseLink} onChange={handleChange} required />
                    <input type="file" name="thumbnail" onChange={handleChange} required />
                    <button type="submit">Upload Course</button>
                </form>
            </div>

            {/* Display Courses */}
            <div className="course-list">
                <h3>Available Courses</h3>
                {courses.length === 0 ? (
                    <p>No courses available.</p>
                ) : (
                    courses.map((course) => (
                        <div key={course._id} className="course-item">
                            <div className="course-info">
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <p><strong>Category:</strong> {course.category} | <strong>Duration:</strong> {course.duration}</p>
                                <p className="course-link"><strong>Course Link:</strong> <a href={course.courseLink} target="_blank" rel="noopener noreferrer">View Course</a></p>
                            </div>
                            {course.thumbnail && <img className="course-thumbnail" src={`http://localhost:5000/uploads/${course.thumbnail}`} alt={course.title} />}
                            <button className="delete-button" onClick={() => handleDelete(course._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageCourses;
