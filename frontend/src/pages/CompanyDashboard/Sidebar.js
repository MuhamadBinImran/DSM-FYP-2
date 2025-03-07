// import React from "react";
// import { Briefcase, Users, Search, Home, LogOut } from "lucide-react";
// import "./Sidebar.css";

// export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
//   return (
//     <aside className="sidebar">
//       <div className="logo">CompanyLogo</div>
//       <div className="nav-buttons">
//         <button
//           className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
//           onClick={() => setActiveTab("dashboard")}
//         >
//           <Home className="icon" />
//           <span>Dashboard</span>
//         </button>
//         <button
//           className={`tab-btn ${activeTab === "postedJobs" ? "active" : ""}`}
//           onClick={() => setActiveTab("postedJobs")}
//         >
//           <Briefcase className="icon" />
//           <span>Posted Jobs</span>
//         </button>
//         <button
//           className={`tab-btn ${activeTab === "availableUsers" ? "active" : ""}`}
//           onClick={() => setActiveTab("availableUsers")}
//         >
//           <Users className="icon" />
//           <span>Available Users</span>
//         </button>
//         <button
//           className={`tab-btn ${activeTab === "postJob" ? "active" : ""}`}
//           onClick={() => setActiveTab("postJob")}
//         >
//           <Search className="icon" />
//           <span>Post a Job</span>
//         </button>
//       </div>
//       <button
//         className="tab-btn logout-btn"
//         onClick={handleLogout}
//       >
//         <LogOut className="icon" />
//         <span>Logout</span>
//       </button>
//     </aside>
//   );
// }





import React from "react";
import { Briefcase, Users, Search, Home, LogOut, LayoutDashboard } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ activeTab, setActiveTab, handleLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="logo-text">Company</h1>
        </div>
      </div>

      <nav className="nav-container">
        <div className="nav-buttons">
          <button
            className={`nav-button ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <Home className="icon" size={20} />
            <span>Dashboard</span>
            <div className="nav-indicator"></div>
          </button>

          <button
            className={`nav-button ${activeTab === "postedJobs" ? "active" : ""}`}
            onClick={() => setActiveTab("postedJobs")}
          >
            <Briefcase className="icon" size={20} />
            <span>Posted Jobs</span>
            <div className="nav-indicator"></div>
          </button>

          <button
            className={`nav-button ${activeTab === "availableUsers" ? "active" : ""}`}
            onClick={() => setActiveTab("availableUsers")}
          >
            <Users className="icon" size={20} />
            <span>Available Users</span>
            <div className="nav-indicator"></div>
          </button>

          <button
            className={`nav-button ${activeTab === "postJob" ? "active" : ""}`}
            onClick={() => setActiveTab("postJob")}
          >
            <Search className="icon" size={20} />
            <span>Post a Job</span>
            <div className="nav-indicator"></div>
          </button>
          <button
  className={`nav-button ${activeTab === "chatbot" ? "active" : ""}`}
  onClick={() => setActiveTab("chatbot")}
>
  <Users className="icon" size={20} />
  <span>Chatbot</span>
  <div className="nav-indicator"></div>
</button>

        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="icon" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}