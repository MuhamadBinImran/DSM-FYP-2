// React frontend
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Admin-Login.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });
  
      if (response.status === 200) {
        alert(response.data.message);
        navigate("/Admin-Dashboard");
      } else {
        alert("Unexpected response from server.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Server error during login.");
      console.log(error.response);
    }
  };
  

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
