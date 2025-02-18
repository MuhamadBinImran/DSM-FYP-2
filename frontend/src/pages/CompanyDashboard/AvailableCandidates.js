// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./AvailableCandidates.css";

// export default function AvailableCandidates() {
//   const [candidates, setCandidates] = useState([]); // Store users
//   const [error, setError] = useState(""); // Error handling
//   const [sendingEmails, setSendingEmails] = useState({}); // Track sending state for each candidate

//   useEffect(() => {
//     // Fetch candidates data from the API
//     const fetchCandidates = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/user/get-all-users"); // Adjust the URL to match your API endpoint
//         setCandidates(response.data.users); // Store the fetched users
//       } catch (err) {
//         setError("Error fetching candidates.");
//         console.error(err);
//       }
//     };

//     fetchCandidates();
//   }, []); // Empty dependency array ensures this runs once when the component mounts

//   // Handle sending job offer email
//   const handleOfferJob = async (candidateEmail) => {
//     setSendingEmails((prev) => ({ ...prev, [candidateEmail]: true })); // Set "sending" state for the specific candidate
//     try {
//       // Call API endpoint to send email
//       const response = await axios.post("http://localhost:5000/api/send-job-offer", { email: candidateEmail });

//       // Handle success
//       if (response.data.success) {
//         alert(`Job offer sent to ${candidateEmail}`);
//       } else {
//         alert("Failed to send job offer. Try again later.");
//       }
//     } catch (err) {
//       setError("Error sending job offer.");
//       console.error(err);
//     } finally {
//       setSendingEmails((prev) => ({ ...prev, [candidateEmail]: false })); // Reset "sending" state for the specific candidate
//     }
//   };
//   return (
//     <div>
//       <h2>Available Candidates</h2>
//       {error && <div className="error-message">{error}</div>}
//       <div className="candidate-list">
//         {candidates.length > 0 ? (
//           candidates.map((candidate) => (
//             <div key={candidate._id} className="candidate-card">
//               {/* If the candidate has an avatar, use it, otherwise show a default avatar */}
//               <img
//                 src={"/man.png"}
//                 alt={`${candidate.name}`}
//                 className="candidate-avatar"
//               />
//               <div>
//                 <p className="candidate-name">{candidate.name}</p>
//                 <p className="candidate-email">Email: {candidate.email}</p>
//                 {/* Add any additional info (like role or skills) */}
//                 <button
//                   onClick={() => handleOfferJob(candidate.email)}
//                   disabled={sendingEmails[candidate.email]} // Disable the button while sending email for this candidate
//                   className="offer-job-button"
//                 >
//                   {sendingEmails[candidate.email] ? "Sending..." : "Offer Job"}
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p>No candidates available at the moment.</p>
//         )}
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Mail, Briefcase, Users, AlertCircle } from 'lucide-react';
import "./AvailableCandidates.css"

export default function AvailableCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState("");
  const [sendingEmails, setSendingEmails] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/get-all-users");
        setCandidates(response.data.users);
      } catch (err) {
        setError("Error fetching candidates.");
        console.error(err);
      }
    };

    fetchCandidates();
  }, []);

  const handleOfferJob = async (candidateEmail) => {
    setSendingEmails((prev) => ({ ...prev, [candidateEmail]: true }));
    try {
      const response = await axios.post("http://localhost:5000/api/send-job-offer", { email: candidateEmail });
      if (response.data.success) {
        alert(`Job offer sent to ${candidateEmail}`);
      } else {
        alert("Failed to send job offer. Try again later.");
      }
    } catch (err) {
      setError("Error sending job offer.");
      console.error(err);
    } finally {
      setSendingEmails((prev) => ({ ...prev, [candidateEmail]: false }));
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="candidates-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Available Candidates</h1>
          <p>Connect with talented professionals ready for new opportunities</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-container">
        <div className="stat-item">
          <Users className="stat-icon" size={24} />
          <div className="stat-info">
            <h3>{candidates.length}</h3>
            <p>Total Candidates</p>
          </div>
        </div>
        <div className="stat-item">
          <Briefcase className="stat-icon" size={24} />
          <div className="stat-info">
            <h3>Active</h3>
            <p>Recruitment Status</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search candidates by name or email..."
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

      {/* Candidates Grid */}
      <div className="candidates-grid">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
              <div className="candidate-header">
                <img
                  src={"/man.png"}
                  alt={`${candidate.name}`}
                  className="candidate-avatar"
                />
                <div className="candidate-status">Active</div>
              </div>
              <div className="candidate-info">
                <h3>{candidate.name}</h3>
                <div className="email-container">
                  <Mail size={16} />
                  <span>{candidate.email}</span>
                </div>
                <button
                  onClick={() => handleOfferJob(candidate.email)}
                  disabled={sendingEmails[candidate.email]}
                  className={`offer-button ${sendingEmails[candidate.email] ? 'sending' : ''}`}
                >
                  {sendingEmails[candidate.email] ? (
                    <>
                      <span className="loading-spinner"></span>
                      Sending...
                    </>
                  ) : (
                    'Offer Job'
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <Users size={48} />
            <p>No candidates available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
