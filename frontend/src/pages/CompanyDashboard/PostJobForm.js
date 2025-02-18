// import React, { useState } from "react";
// import axios from "axios";
// import "./PostJobForm.css";

// export default function PostJobForm() {
//   const [jobTitle, setJobTitle] = useState("");
//   const [jobDescription, setJobDescription] = useState("");
//   const [companyEmail, setCompanyEmail] = useState(""); // Added email field
//   const [companyName, setCompanyName] = useState(""); // Added company name field
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const Base_Url = "http://localhost:5000";

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!jobTitle || !jobDescription || !companyEmail || !companyName) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     try {
//       const response = await axios.post(`${Base_Url}/api/company/post-job`, {
//         jobTitle,
//         jobDescription,
//         companyEmail,
//         companyName, // Include companyName in the request
//       });

//       if (response.status === 200) {
//         setSuccessMessage(response.data.message);
//         setJobTitle("");
//         setJobDescription("");
//         setCompanyEmail("");
//         setCompanyName(""); // Clear companyName after submission
//       } else {
//         setError(response.data.message);
//       }
//     } catch (err) {
//       console.error("Error posting job:", err);
//       setError("Server error while posting job.");
//     }
//   };

//   return (
//     <div>
//       <h2>Post a Job</h2>
//       <form className="post-job-form" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Job Title"
//           className="input"
//           value={jobTitle}
//           onChange={(e) => setJobTitle(e.target.value)}
//         />
//         <textarea
//           placeholder="Job Description"
//           className="textarea"
//           value={jobDescription}
//           onChange={(e) => setJobDescription(e.target.value)}
//         ></textarea>
//         <input
//           type="email"
//           placeholder="Company Email"
//           className="input"
//           value={companyEmail}
//           onChange={(e) => setCompanyEmail(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Company Name"
//           className="input"
//           value={companyName}
//           onChange={(e) => setCompanyName(e.target.value)}
//         />
//         <button type="submit" className="btn-submit">
//           Submit
//         </button>
//         {error && <div className="error-message">{error}</div>}
//         {successMessage && <div className="success-message">{successMessage}</div>}
//       </form>
//     </div>
//   );
// }




import React, { useState } from "react";
import axios from "axios";
import { Building2, BriefcaseIcon, MailIcon, Send } from "lucide-react";
import "./PostJobForm.css";

export default function PostJobForm() {
  // Keeping original state management
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Keeping original Base_Url
  const Base_Url = "http://localhost:5000";

  // Keeping original handleSubmit logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jobTitle || !jobDescription || !companyEmail || !companyName) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await axios.post(`${Base_Url}/api/company/post-job`, {
        jobTitle,
        jobDescription,
        companyEmail,
        companyName,
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
        setJobTitle("");
        setJobDescription("");
        setCompanyEmail("");
        setCompanyName("");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error("Error posting job:", err);
      setError("Server error while posting job.");
    }
  };

  return (
    <div className="post-job-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Post Your Job</h1>
          <p>Find the perfect candidate for your company</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-container">
        <div className="form-header">
          <h2>Create a Job Posting</h2>
          <p>Fill in the details below to post your job opening</p>
        </div>

        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-group">
            <label>
              <BriefcaseIcon className="icon" />
              Job Title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Building2 className="icon" />
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Tech Solutions Inc"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <MailIcon className="icon" />
              Company Email
            </label>
            <input
              type="email"
              value={companyEmail}
              onChange={(e) => setCompanyEmail(e.target.value)}
              placeholder="e.g. hr@company.com"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Send className="icon" />
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter detailed job description..."
              className="form-textarea"
            />
          </div>

          <button type="submit" className="submit-button">
            Post Job
          </button>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}
        </form>
      </div>
    </div>
  );
}