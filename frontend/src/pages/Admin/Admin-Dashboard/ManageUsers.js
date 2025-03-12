import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Trash2, UserPlus, Users, UserCheck, AlertCircle } from "lucide-react";
import "./ManageUser.css";

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    // Fetch Users from Backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:5000/api/users");
            setUsers(response.data);
            
            // Calculate stats
            setStats({
                totalUsers: response.data.length,
                activeUsers: response.data.filter(user => user.status === 'active').length || 0,
                newUsersToday: response.data.filter(user => {
                    const today = new Date();
                    const userDate = new Date(user.createdAt);
                    return userDate.toDateString() === today.toDateString();
                }).length
            });
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
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

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-users-container">
            {/* Stats Section */}
            <div className="stats-container">
                <div className="stat-card">
                    <Users size={24} className="stat-icon" />
                    <div className="stat-number">{stats.totalUsers}</div>
                    <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                    <UserCheck size={24} className="stat-icon" />
                    <div className="stat-number">{stats.activeUsers}</div>
                    <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                    <UserPlus size={24} className="stat-icon" />
                    <div className="stat-number">{stats.newUsersToday}</div>
                    <div className="stat-label">New Today</div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <Search className="search-icon" size={20} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* User List */}
            <div className="user-list">
                {loading ? (
                    <div className="empty-state">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <p>No users found matching your search criteria.</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className="user-card">
                            <div className="user-info">
                                <h3>{user.name}</h3>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Status:</strong> {user.status || 'Active'}</p>
                                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="user-actions">
                                <button 
                                    className="delete-button"
                                    onClick={() => handleDelete(user._id)}
                                >
                                    <Trash2 size={16} /> Delete User
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
