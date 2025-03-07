import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageUser.css"; // Import CSS file

const ManageUsers = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch Users from Backend
    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/users");
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Handle User Deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5000/api/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    return (
        <div className="manage-users-container">
            <h2>Manage Users</h2>

            {/* User List */}
            <div className="user-list">
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    users.map((user) => (
                        <div key={user._id} className="user-card">
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <p><strong>Email:</strong> {user.email}</p>
                            </div>
                            <button className="delete-button" onClick={() => handleDelete(user._id)}>Delete</button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
