// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./PostedJobs.css";

// const Base_Url = 'http://localhost:5000'; // Make sure the backend URL is correct

// export default function PostedJobs() {
//   const [jobs, setJobs] = useState([]);
//   const [error, setError] = useState("");

//   // Fetch jobs when the component is mounted
//   useEffect(() => {
//     const fetchJobs = async () => {
//       try {
//         const response = await axios.get(`${Base_Url}/api/company/get-jobs`);
//         setJobs(response.data.jobs); // Store jobs in the state
//       } catch (err) {
//         setError("Error fetching jobs.");
//         console.error(err);
//       }
//     };

//     fetchJobs();
//   }, []); // Empty dependency array ensures this runs once when component mounts

//   return (
//     <div>
//       <h2>Posted Jobs</h2>
//       {error && <div className="error-message">{error}</div>}
//       <ul className="job-list">
//         {jobs.length > 0 ? (
//           jobs.map((job) => (
//             <li key={job._id} className="job-card">
//               <p className="job-position"><strong>Job Title:</strong> {job.jobTitle}</p>
//               <p className="job-description"><strong>Description:</strong> {job.jobDescription}</p>
//               <p className="job-company"><strong>Company Name:</strong> {job.companyName}</p> {/* Company Name */}
//               <p className="job-email"><strong>Company Email:</strong> {job.companyEmail}</p>
//             </li>
//           ))
//         ) : (
//           <li>No jobs available at the moment.</li>
//         )}
//       </ul>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, Building2, Mail, Search, AlertCircle, FileText, Clock } from 'lucide-react';
import "./PostedJobs.css";

const Base_Url = 'http://localhost:5000';

export default function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${Base_Url}/api/company/get-jobs`);
        setJobs(response.data.jobs);
      } catch (err) {
        setError("Error fetching jobs.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="jobs-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Posted Jobs</h1>
          <p>Browse through our latest job opportunities</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-item">
          <Briefcase className="stat-icon" size={24} />
          <div className="stat-info">
            <h3>{jobs.length}</h3>
            <p>Total Jobs</p>
          </div>
        </div>
        <div className="stat-item">
          <Clock className="stat-icon" size={24} />
          <div className="stat-info">
            <h3>Active</h3>
            <p>Listing Status</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-container">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading jobs...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="job-card-header">
                <Briefcase className="job-icon" size={24} />
                <div className="job-status">Active</div>
              </div>
              
              <div className="job-card-content">
                <h3 className="job-title">{job.jobTitle}</h3>
                
                <div className="company-info">
                  <div className="info-item">
                    <Building2 size={16} />
                    <span>{job.companyName}</span>
                  </div>
                  <div className="info-item">
                    <Mail size={16} />
                    <span>{job.companyEmail}</span>
                  </div>
                </div>

                <div className="job-description">
                  <div className="description-header">
                    <FileText size={16} />
                    <h4>Description</h4>
                  </div>
                  <p>{job.jobDescription}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <Briefcase size={48} />
            <p>No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}