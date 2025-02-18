// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./CompanyDashboard.css";

// const Base_Url = 'http://localhost:5000'; // Ensure this is your correct backend URL

// export default function CompanyDashboard() {
//   const [stats, setStats] = useState({
//     totalJobs: 0,
//     totalApplications: 0,
//     totalUsers: 0,
//   });
//   const [error, setError] = useState("");

//   // Fetch company stats when the component is mounted
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const response = await axios.get(`${Base_Url}/api/company/stats`);
//         setStats(response.data);  // Store the stats data in state
//       } catch (err) {
//         setError(err.response ? err.response.data.message : 'Error fetching stats');
//       }
//     };
  
//     fetchStats();
//   }, []);

//   return (
//     <div>
//       <h2>Company Stats</h2>
//       {error && <div className="error-message">{error}</div>}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon">📊</div> {/* You can use an icon or image here */}
//           <div className="stat-info">
//             <p className="stat-label">Total Jobs</p>
//             <p className="stat-value">{stats.totalJobs}</p>
//           </div>
//         </div>
  
//         <div className="stat-card">
//           <div className="stat-icon">📝</div>
//           <div className="stat-info">
//             <p className="stat-label">Total Applications</p>
//             <p className="stat-value">{stats.totalApplications}</p>
//           </div>
//         </div>
  
//         <div className="stat-card">
//           <div className="stat-icon">👥</div>
//           <div className="stat-info">
//             <p className="stat-label">Total Users</p>
//             <p className="stat-value">{stats.totalUsers}</p>
//           </div>
//         </div>
  
//         {/* Add more cards as needed */}
//       </div>
//     </div>
//   );
  
// }



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./CompanyDashboard.css";

// const base_url = 'http://localhost:5000';

// const CompanyStats = () => {
//   const [stats, setStats] = useState({ jobCount: 0, userCount: 0, totalRevenue: 0, activeJobs: 0 });

//   useEffect(() => {
//     const fetchStats = async () => {
//       const response = await fetch(`${base_url}/api/company/stats`);
//       const data = await response.json();
//       setStats(data.stats); // Assuming the response structure has the stats object
//     };

//     fetchStats();
//   }, []);

//   return (
//     <div className="dashboard-container">
//       <h3 className="dashboard-title">Company Dashboard</h3>
//       <div className="cards-container">
//         <div className="card">
//           <div className="card-title">Available Jobs</div>
//           <div className="card-content">{stats.jobCount}</div>
//         </div>
//         <div className="card">
//           <div className="card-title">Users Count</div>
//           <div className="card-content">{stats.userCount}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CompanyStats;


import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';
import "./DashboardStats.css"

const base_url = 'http://localhost:5000';

const CompanyStats = () => {
  const [stats, setStats] = useState({ 
    jobCount: 0, 
    userCount: 0, 
    totalRevenue: 0, 
    activeJobs: 0 
  });

  // Mock data for graph - replace with actual data from API if available
  const mockData = [
    { name: 'Jan', jobs: 65 },
    { name: 'Feb', jobs: 78 },
    { name: 'Mar', jobs: 90 },
    { name: 'Apr', jobs: 81 },
    { name: 'May', jobs: 86 },
    { name: 'Jun', jobs: 95 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch(`${base_url}/api/company/stats`);
      const data = await response.json();
      setStats(data.stats);
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Company Dashboard</h1>
        <p>Track your company's performance and growth metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Briefcase className="icon" size={24} />
          </div>
          <div className="stat-details">
            <h3>Available Jobs</h3>
            <p className="stat-number">{stats.jobCount}</p>
            <span className="stat-label">Total positions</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users className="icon" size={24} />
          </div>
          <div className="stat-details">
            <h3>Users</h3>
            <p className="stat-number">{stats.userCount}</p>
            <span className="stat-label">Registered users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="icon" size={24} />
          </div>
          <div className="stat-details">
            <h3>Active Jobs</h3>
            <p className="stat-number">{stats.activeJobs}</p>
            <span className="stat-label">Current active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign className="icon" size={24} />
          </div>
          <div className="stat-details">
            <h3>Revenue</h3>
            <p className="stat-number"></p>
            <span className="stat-label">Total earnings</span>
          </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="graph-section">
        <h2>Job Postings Trend</h2>
        <div className="graph-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="jobs" 
                stroke="#4F46E5" 
                strokeWidth={2}
                dot={{ fill: '#4F46E5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;