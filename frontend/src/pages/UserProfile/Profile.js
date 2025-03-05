import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./userprofile_css/Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Fetch user data from localStorage (Simulating backend user session)
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || {
    name: "John Doe",
    email: "john.doe@example.com",
    skills: ["React", "JavaScript", "Node.js"],
    profilePicture: "https://via.placeholder.com/150",
  };

  const [user, setUser] = useState(storedUser);
  const [editing, setEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(storedUser);

  // Handle profile picture upload
  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUpdatedUser({ ...updatedUser, profilePicture: imageUrl });
    }
  };

  // Handle input field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUpdatedUser({ ...updatedUser, [name]: value });
  };

  // Save updated user data
  const handleSave = () => {
    setUser(updatedUser);
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser)); // Simulating saving to backend
    setEditing(false);
    alert("Profile updated successfully!");
  };

  return (
    <div className="profile-page-container">
      <div className="profile-page-card">
        <h2 className="profile-page-title">My Profile</h2>

        <div className="profile-page-picture-section">
          <img src={updatedUser.profilePicture} alt="Profile" className="profile-page-picture" />
          <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
        </div>

        <div className="profile-page-info">
          <label>Name:</label>
          <p>{user.name}</p> {/* Name remains non-editable */}

          <label>Email:</label>
          <p>{user.email}</p> {/* Email remains non-editable */}

          <label>Skills:</label>
          {editing ? (
            <input
              type="text"
              name="skills"
              value={updatedUser.skills.join(", ")}
              onChange={(e) =>
                setUpdatedUser({ ...updatedUser, skills: e.target.value.split(", ") })
              }
              className="profile-page-input"
            />
          ) : (
            <p>{user.skills.join(", ")}</p>
          )}
        </div>

        <div className="profile-page-actions">
          {editing ? (
            <button onClick={handleSave} className="profile-page-save-btn">
              Save Changes
            </button>
          ) : (
            <button onClick={() => setEditing(true)} className="profile-page-edit-btn">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
