import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, GraduationCap } from "lucide-react";
import "./ChooseRolePage.css";

function ChooseRolePage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === "Talent") {
      navigate("/user-signup");
    } else if (selectedRole === "Company") {
      navigate("/company-signup");
    }
  };

  return (
    <div className="choose-role-container">
      <div className="choose-role-card">
        {/* Logo Placeholder */}
        <div className="choose-role-logo-container">
          <div className="choose-role-logo"></div>
        </div>

        {/* Header */}
        <h1 className="choose-role-title">Select User Type</h1>
        <p className="choose-role-subtitle">Choose the role that describes you.</p>

        {/* Role Selection */}
        <div className="choose-role-options">
          {/* Talent Option */}
          <button
            onClick={() => handleRoleSelection("Talent")}
            className={`choose-role-button ${
              selectedRole === "Talent" ? "role-selected" : ""
            }`}
          >
            <GraduationCap
              className={`role-icon ${
                selectedRole === "Talent" ? "icon-selected" : ""
              }`}
            />
            <span className="role-label">User</span>
          </button>

          {/* Company Option */}
          <button
            onClick={() => handleRoleSelection("Company")}
            className={`choose-role-button ${
              selectedRole === "Company" ? "role-selected" : ""
            }`}
          >
            <Briefcase
              className={`role-icon ${
                selectedRole === "Company" ? "icon-selected" : ""
              }`}
            />
            <span className="role-label">Company</span>
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`choose-role-continue-button ${
            selectedRole ? "button-enabled" : "button-disabled"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default ChooseRolePage;
