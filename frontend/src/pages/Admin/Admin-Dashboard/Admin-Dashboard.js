import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ManageCourses from "./Manage-Courses";
import ManageUsers from "./ManageUsers";
import ManageJobs from "./Manage-Jobs";
import {
  Users,
  Briefcase,
  FileCheck,
  BookOpen,
  LogOut,
  ChevronRight,
  TrendingUp,
  Activity,
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart2,
  PieChart,
  User
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    assessments: 0,
    courses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (activeTab === "overview" && !loading) {
      fetchDashboardData();
    }
  }, [activeTab, loading]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch dashboard statistics
      const statsResponse = await axios.get("http://localhost:5000/api/admin/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {
        // If API fails, use mock data
        return { 
          data: {
            users: 0,
            jobs: 0,
            assessments: 0,
            courses: 0
          }
        };
      });
      
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Fetch recent activity
      const activityResponse = await axios.get("http://localhost:5000/api/admin/dashboard/activity", {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {
        // If API fails, use mock data
        return { 
          data: [
            {
              type: 'user',
              action: 'New User Registration',
              description: 'A new user has registered on the platform',
              time: 'Today at 8:45 AM'
            },
            {
              type: 'job',
              action: 'Job Posted',
              description: 'A new job has been posted by Company XYZ',
              time: 'Yesterday at 3:20 PM'
            }
          ]
        };
      });
      
      if (activityResponse.data) {
        setRecentActivity(activityResponse.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate("/Admin-Login");
        return;
      }

      // Decode token to verify it's an admin token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (tokenData.role !== 'admin') {
        throw new Error('Not authorized as admin');
      }

      const response = await axios.get("http://localhost:5000/api/admin/check-auth", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.isAuthenticated) {
        setAdminData(response.data.admin);
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem('authToken');
      navigate("/Admin-Login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Call logout endpoint
      await axios.post("http://localhost:5000/api/admin/logout", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('authToken');
      navigate("/Admin-Login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/Admin-Login")}>Return to Login</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="overview-container">
            {adminData && (
              <div className="admin-info">
                <div className="admin-profile">
                  <div className="admin-avatar">
                    {adminData.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-details">
                    <h3>Welcome, Admin</h3>
                    <p className="admin-email">{adminData.email}</p>
                    <div className="session-info">
                      <span className="session-status active">Active Session</span>
                    </div>
                  </div>
                </div>
                <div className="session-time">
                  <Clock size={14} />
                  <span>Last login: Today at 9:30 AM</span>
                </div>
              </div>
            )}
            
            <div className="dashboard-section">
              <h2 className="section-title">
                <BarChart2 size={20} />
                Platform Statistics
              </h2>
              <div className="statsio_containerz">
                <div className="statio_cardz">
                  <div className="statio_iconz user-icon">
                    <Users size={24} />
                  </div>
                  <div className="statio_infoz">
                    <h3>{stats.users || 0}</h3>
                    <p>Total Users</p>
                    <div className="stat-trend positive">
                      <span>+5.2%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="statio_cardz">
                  <div className="statio_iconz job-icon">
                    <Briefcase size={24} />
                  </div>
                  <div className="statio_infoz">
                    <h3>{stats.jobs || 0}</h3>
                    <p>Active Jobs</p>
                    <div className="stat-trend positive">
                      <span>+12.3%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="statio_cardz">
                  <div className="statio_iconz assessment-icon">
                    <FileCheck size={24} />
                  </div>
                  <div className="statio_infoz">
                    <h3>{stats.assessments || 0}</h3>
                    <p>Assessments</p>
                    <div className="stat-trend negative">
                      <span>-2.1%</span> from last month
                    </div>
                  </div>
                </div>

                <div className="statio_cardz">
                  <div className="statio_iconz course-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="statio_infoz">
                    <h3>{stats.courses || 0}</h3>
                    <p>Courses</p>
                    <div className="stat-trend positive">
                      <span>+8.7%</span> from last month
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="dashboard-grid">
              <div className="dashboard-section">
                <h2 className="section-title">
                  <Activity size={20} />
                  Recent Activity
                </h2>
                <div className="recent_activity_sectionz">
                  {recentActivity && recentActivity.length > 0 ? (
                    <ul className="activity_listz">
                      {recentActivity.map((activity, index) => (
                        <li key={index}>
                          <div className="activity-content">
                            <div className="activity-icon">
                              {activity.type === 'user' && <User size={16} />}
                              {activity.type === 'job' && <Briefcase size={16} />}
                              {activity.type === 'course' && <BookOpen size={16} />}
                            </div>
                            <div className="activity-details">
                              <strong>{activity.action}</strong>
                              <p>{activity.description}</p>
                            </div>
                          </div>
                          <div className="activity-time">
                            <Calendar size={14} />
                            <span>{activity.time || 'Just now'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="empty-state">
                      <p>No recent activity to display</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="dashboard-section">
                <h2 className="section-title">
                  <PieChart size={20} />
                  System Status
                </h2>
                <div className="status-container">
                  <div className="status-card">
                    <div className="status-header">
                      <h3>Platform Services</h3>
                      <div className="status-indicator online">
                        <CheckCircle size={16} />
                        <span>All Systems Operational</span>
                      </div>
                    </div>
                    <div className="status-items">
                      <div className="status-item">
                        <span className="service-name">User Authentication</span>
                        <span className="service-status online">
                          <CheckCircle size={14} />
                        </span>
                      </div>
                      <div className="status-item">
                        <span className="service-name">Job Listings</span>
                        <span className="service-status online">
                          <CheckCircle size={14} />
                        </span>
                      </div>
                      <div className="status-item">
                        <span className="service-name">Course Management</span>
                        <span className="service-status online">
                          <CheckCircle size={14} />
                        </span>
                      </div>
                      <div className="status-item">
                        <span className="service-name">Assessment Engine</span>
                        <span className="service-status warning">
                          <AlertCircle size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "manage-users":
        return <ManageUsers />;

      case "manage-jobs":
        return <ManageJobs />;

      case "manage-courses":
        return <ManageCourses />;

      default:
        return <div>Select a valid option from the sidebar.</div>;
    }
  };

  return (
    <div className="dashboardio_containerz">
      <aside className="sidebario_navz">
        <div className="sidebario_headerz">
          <h2>Admin Portal</h2>
          {adminData && (
            <div className="admin-profile">
              <div className="admin-avatar">
                {adminData.email?.charAt(0).toUpperCase()}
              </div>
              <div className="admin-details">
                <p className="admin-email">{adminData.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="sidebario_menuz">
          {[
            { tab: "overview", icon: TrendingUp, label: "Overview" },
            { tab: "manage-users", icon: Users, label: "Manage Users" },
            { tab: "manage-jobs", icon: Briefcase, label: "Manage Jobs" },
            { tab: "manage-courses", icon: BookOpen, label: "Manage Courses" },
          ].map((item) => (
            <button
              key={item.tab}
              className={`menuz_itemz ${activeTab === item.tab ? "active" : ""}`}
              onClick={() => setActiveTab(item.tab)}
            >
              <item.icon className="menuz_iconz" />
              <span>{item.label}</span>
              <ChevronRight className="arrowo_iconz" />
            </button>
          ))}

          <button 
            className="menuz_itemz logouto_btnz" 
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="menuz_iconz" />
            <span>{loading ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      <main className="mainio_contentz">
        <header className="dashboardio_headerz">
          <div className="headerio_leftz">
            <h1>
              {activeTab === "overview" ? "Admin Dashboard" : 
               activeTab === "manage-users" ? "Manage Users" :
               activeTab === "manage-jobs" ? "Manage Jobs" :
               activeTab === "manage-courses" ? "Manage Courses" : 
               "Admin Dashboard"}
            </h1>
            <p>Manage and monitor your platform</p>
          </div>
          
          <div className="headerio_rightz">
            <div className="notifio_bellz">
              <Bell className="iconz" />
              <span className="notifio_badgez">3</span>
            </div>
          </div>
        </header>

        <section className="dashboardio_contentz">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
