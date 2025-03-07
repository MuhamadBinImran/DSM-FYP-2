import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Manage-Jobs.css"; // Import CSS file

const ManageJobs = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetchJobs();
    }, []);

    // Fetch Jobs from Backend
    const fetchJobs = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/jobs");
            setJobs(response.data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    // Handle Job Deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this job posting?")) {
            try {
                await axios.delete(`http://localhost:5000/api/jobs/${id}`);
                fetchJobs();
            } catch (error) {
                console.error("Error deleting job:", error);
            }
        }
    };

    return (
        <div className="manage-jobs-container">
            <h2>Manage Job Postings</h2>

            {/* Job List */}
            <div className="job-list">
                {jobs.length === 0 ? (
                    <p>No jobs found.</p>
                ) : (
                    jobs.map((job) => (
                        <div key={job._id} className="job-card">
                            <div className="job-info">
                                <h3>{job.jobTitle}</h3>
                                <p>{job.jobDescription}</p>
                                <p><strong>Company:</strong> {job.companyName}</p>
                                <p><strong>Contact:</strong> {job.companyEmail}</p>
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(job._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageJobs;
