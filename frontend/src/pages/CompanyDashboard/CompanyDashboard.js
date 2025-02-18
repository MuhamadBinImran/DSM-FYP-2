import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardStats from "./DashboardStats";
import PostedJobs from "./PostedJobs";
import AvailableCandidates from "./AvailableCandidates";
import PostJobForm from "./PostJobForm";
import "./CompanyDashboard.css"
export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No token found, redirecting to login...");
      navigate("/company-signup");
    } else {
      // If token exists, ensure the dashboard is active by default
      setActiveTab("dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />;
      case "postedJobs":
        return <PostedJobs />;
      case "availableUsers":
        return <AvailableCandidates />;
      case "postJob":
        return <PostJobForm />;
      default:
        return <p>Invalid tab selected</p>;
    }
  };

  return (
    <div className="company-dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <main className="content">{renderContent()}</main>
    </div>
  );
}
