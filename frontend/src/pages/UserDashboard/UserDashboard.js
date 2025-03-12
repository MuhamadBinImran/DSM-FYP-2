import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Navigate } from "react-router-dom";
import Profile from "../UserProfile/Profile";
import "./UserDashboard.css";
import { toast } from 'react-toastify';

import {
  Briefcase,
  Book,
  Target,
  CheckSquare,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Calendar,
  Award,
  TrendingUp,
  Settings,
  Users,
  Medal,
  MessageSquare,
  Bot,
  Send,
  X
} from "lucide-react";


import Chatbot from "../CHATBOT/Chatbot";

// Initial profile state
const initialProfileState = {
  name: "",
  email: "",
  skills: [],
  profilePicture: null,
  recentActivity: []
};

// Task Item Component
const TaskItem = ({ task, onComplete }) => (
  <li className="taskio_cardz">
    <h3>{task.title}</h3>
    <p>Deadline: {task.deadline}</p>
    <p>Status: {task.status}</p>
    {task.status !== "Completed" && (
      <button onClick={() => onComplete(task.id)} className="btn_completio">
        Mark as Completed
      </button>
    )}
  </li>
);

// Learning Path Item Component
const LearningPathItem = ({ path, onContinue }) => (
  <li className="learnio_cardz">
    <h3>{path.course}</h3>
    <p>Provider: {path.provider}</p>
    <p>Progress: {path.progress}%</p>
    <div className="progresso_barz">
      <div
        className="progresso_fillz"
        style={{ width: `${path.progress}%` }}
      ></div>
    </div>
    {path.progress < 100 && (
      <button onClick={() => onContinue(path.id)} className="btn_continuo">
        Continue Learning
      </button>
    )}
  </li>
);

// Job Item Component
const JobItem = ({ job, onApply }) => (
  <li className="jobio_cardz">
    <h3>{job.jobTitle}</h3>
    <p><strong>Company:</strong> {job.companyName}</p>
    <p><strong>Match:</strong> 85%</p>
    <p><strong>Description:</strong> {job.jobDescription}</p>
    <button onClick={() => onApply(job.id)} className="btn_applyio">
      Apply Now
    </button>
  </li>
);


// Profile Dropdown Component
const ProfileDropdown = ({
  userProfile,
  isDropdownOpen,
  handleDropdownToggle,
  navigate,
  handleLogout,
  setActiveTab,
}) => {
  const base_url = "http://localhost:5000";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.profilio_dropdownz');
      if (dropdown && !dropdown.contains(event.target) && isDropdownOpen) {
        handleDropdownToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, handleDropdownToggle]);

  return (
    <div className="profilio_dropdownz">
      <div
        className="profilio_triggerz"
        onClick={handleDropdownToggle}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleDropdownToggle();
          }
        }}
      >
        <img
          src={userProfile.profilePicture
            ? `${base_url}${userProfile.profilePicture}`
            : `${process.env.PUBLIC_URL}/default-avatar.png`}
          alt={`${userProfile.name}'s profile`}
          className="profilio_picz"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `${process.env.PUBLIC_URL}/default-avatar.png`;
          }}
        />
        <span className="profilio_namez">{userProfile.name}</span>
      </div>
      {isDropdownOpen && (
        <div className="dropdownio_menuz">
          <div className="dropdownio_headerz">
            <div className="dropdownio_profilio_infoz">
              <img
                src={userProfile.profilePicture
                  ? `${base_url}${userProfile.profilePicture}`
                  : `${process.env.PUBLIC_URL}/default-avatar.png`}
                alt="Profile"
                className="dropdownio_profilio_picz"
              />
              <div className="dropdownio_userz_infoz">
                <h4>{userProfile.name}</h4>
                <p className="dropdownio_emailz">{userProfile.email}</p>
              </div>
            </div>
          </div>
          <div className="dropdownio_dividerz"></div>
          <button
            className="dropdownio_optionz"
            onClick={() => setActiveTab("profile")}
          >
            <User size={16} />
            View Profile
          </button>

          <div className="dropdownio_dividerz"></div>
          <button
            className="dropdownio_optionz logouto_btnz"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// Dashboard Stats Component
const DashboardStats = () => (
  <div className="statsio_containerz">
    <div className="statio_cardz">
      <TrendingUp className="statio_iconz" />
      <div className="statio_infoz">
        <h3>85%</h3>
        <p>Profile Completion</p>
      </div>
    </div>
    <div className="statio_cardz">
      <Award className="statio_iconz" />
      <div className="statio_infoz">
        <h3>12</h3>
        <p>Certifications</p>
      </div>
    </div>
    <div className="statio_cardz">
      <Calendar className="statio_iconz" />
      <div className="statio_infoz">
        <h3>5</h3>
        <p>Upcoming Tasks</p>
      </div>
    </div>
  </div>
);

// Session timeout duration (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Overview Component
const OverviewSection = ({ userProfile, stats, learningPaths }) => (
  <div className="contentio_sectionz">
    <h2>Dashboard Overview</h2>
    <div className="overview_statsz">
      <div className="statio_cardz">
        <TrendingUp className="statio_iconz" />
        <div className="statio_infoz">
          <h3>{userProfile.skills.length}</h3>
          <p>Skills Added</p>
        </div>
      </div>
      <div className="statio_cardz">
        <Award className="statio_iconz" />
        <div className="statio_infoz">
          <h3>{learningPaths.filter(path => path.progress === 100).length}</h3>
          <p>Courses Completed</p>
        </div>
      </div>
      <div className="statio_cardz">
        <Users className="statio_iconz" />
        <div className="statio_infoz">
          <h3>{stats.connections || 0}</h3>
          <p>Network Connections</p>
        </div>
      </div>
    </div>

    <div className="overview_gridz">
      <div className="overview_cardz">
        <h3>Recent Activity</h3>
        <div className="activity_listz">
          {userProfile.recentActivity.length > 0 ? (
            userProfile.recentActivity.map((activity, index) => (
              <div key={index} className="activity_itemz">
                <div className="activity_iconz">
                  {activity.type === 'course' && <Book size={16} />}
                  {activity.type === 'skill' && <Target size={16} />}
                  {activity.type === 'job' && <Briefcase size={16} />}
                </div>
                <div className="activity_contentz">
                  <p>{activity.description}</p>
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no_activityz">No recent activity</p>
          )}
        </div>
      </div>

      <div className="overview_cardz">
        <h3>Skill Progress</h3>
        <div className="skills_listz">
          {userProfile.skills.map((skill, index) => (
            <div key={index} className="skill_itemz">
              <div className="skill_infoz">
                <span>{skill.name}</span>
                <span>{skill.level}%</span>
              </div>
              <div className="progresso_barz">
                <div
                  className="progresso_fillz"
                  style={{ width: `${skill.level}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Achievements Component
const AchievementsSection = ({ achievements }) => (
  <div className="contentio_sectionz">
    <h2>Achievements & Badges</h2>
    <div className="achievements_gridz">
      <div className="achievement_cardz">
        <h3>Skill Badges</h3>
        <div className="badges_gridz">
          {achievements.skillBadges?.map((badge, index) => (
            <div key={index} className="badge_itemz">
              <div className="badge_iconz">
                <Medal size={32} />
              </div>
              <h4>{badge.name}</h4>
              <p>{badge.description}</p>
              <span className="badge_levelz">{badge.level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="achievement_cardz">
        <h3>Certifications</h3>
        <div className="certifications_listz">
          {achievements.certifications?.map((cert, index) => (
            <div key={index} className="certification_itemz">
              <div className="cert_iconz">
                <Award size={24} />
              </div>
              <div className="cert_infoz">
                <h4>{cert.name}</h4>
                <p>{cert.provider}</p>
                <span>{new Date(cert.dateEarned).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="achievement_cardz">
        <h3>Leaderboard</h3>
        <div className="leaderboard_listz">
          {achievements.leaderboard?.map((entry, index) => (
            <div key={index} className="leaderboard_itemz">
              <span className="rank_numberz">{index + 1}</span>
              <div className="user_infoz">
                <h4>{entry.name}</h4>
                <p>{entry.points} points</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Community Component
const CommunitySection = ({ stats, connections }) => (
  <div className="contentio_sectionz">
    <h2>Community & Networking</h2>
    <div className="community_gridz">
      <div className="community_cardz">
        <h3>Your Network</h3>
        <div className="network_statsz">
          <div className="stat_itemz">
            <Users className="stat_iconz" />
            <div className="stat_infoz">
              <h4>{stats.connections}</h4>
              <p>Connections</p>
            </div>
          </div>
          <div className="stat_itemz">
            <MessageSquare className="stat_iconz" />
            <div className="stat_infoz">
              <h4>{stats.discussions}</h4>
              <p>Discussions</p>
            </div>
          </div>
          <div className="stat_itemz">
            <Award className="stat_iconz" />
            <div className="stat_infoz">
              <h4>{stats.endorsements}</h4>
              <p>Endorsements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="community_cardz">
        <h3>Recent Connections</h3>
        <div className="connections_listz">
          {connections?.map((connection, index) => (
            <div key={index} className="connection_itemz">
              <img
                src={connection.profilePicture || '/default-avatar.png'}
                alt={connection.name}
                className="connection_avatarz"
              />
              <div className="connection_infoz">
                <h4>{connection.name}</h4>
                <p>{connection.title}</p>
              </div>
              <button className="btn_messagez">
                <MessageSquare size={16} />
                Message
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="community_cardz">
        <h3>Skill Endorsements</h3>
        <div className="endorsements_listz">
          {stats.topEndorsedSkills?.map((skill, index) => (
            <div key={index} className="endorsement_itemz">
              <div className="skill_headerz">
                <h4>{skill.name}</h4>
                <span>{skill.endorsements} endorsements</span>
              </div>
              <div className="endorsers_listz">
                {skill.topEndorsers?.slice(0, 3).map((endorser, idx) => (
                  <img
                    key={idx}
                    src={endorser.profilePicture || '/default-avatar.png'}
                    alt={endorser.name}
                    className="endorser_avatarz"
                    title={endorser.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Floating AI Assistant Component
const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle message submission
    console.log("Message submitted:", message);
    setMessage("");
  };

  return (
    <div className="floating_assistantz">
      <button
        className="assistant_triggerz"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        <Bot className="ai_iconz" />
      </button>

      <div className={`assistant_containerz ${!isOpen ? 'hidden' : ''}`}>
        <div className="assistant_headerz">
          <h3>AI Assistant</h3>
          <button onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="assistant_contentz">
          <Chatbot />
        </div>
        <form className="assistant_inputz" onSubmit={handleSubmit}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

// Main Dashboard Component
export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tasks");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [jobApplicationStatus, setJobApplicationStatus] = useState(null);
  const [userProfile, setUserProfile] = useState(initialProfileState);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [communityStats, setCommunityStats] = useState({
    connections: 0,
    endorsements: 0,
    discussions: 0
  });

  // Initial States
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete React Assessment",
      deadline: "2024-03-20",
      status: "Pending",
    },
    {
      id: 2,
      title: "Submit Python Certification",
      deadline: "2024-03-22",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Prepare Presentation on AI Trends",
      deadline: "2024-03-25",
      status: "Not Started",
    },
    {
      id: 4,
      title: "Review JavaScript Project Code",
      deadline: "2024-03-27",
      status: "In Progress",
    },
    {
      id: 5,
      title: "Upload SQL Assignment",
      deadline: "2024-03-30",
      status: "Pending",
    },
    {
      id: 6,
      title: "Complete Design Mockups",
      deadline: "2024-04-02",
      status: "Completed",
    },
    {
      id: 7,
      title: "Submit Blog on Web Development",
      deadline: "2024-04-05",
      status: "Pending",
    },
    {
      id: 8,
      title: "Finish Data Science Project",
      deadline: "2024-04-10",
      status: "In Progress",
    },
    {
      id: 9,
      title: "Prepare for Cybersecurity Exam",
      deadline: "2024-04-12",
      status: "Not Started",
    },
    {
      id: 10,
      title: "Organize GitHub Repository",
      deadline: "2024-04-15",
      status: "Completed",
    },
    {
      id: 11,
      title: "Update Resume for Job Application",
      deadline: "2024-04-18",
      status: "Pending",
    },
    {
      id: 12,
      title: "Attend Team Collaboration Workshop",
      deadline: "2024-04-20",
      status: "Not Started",
    },
  ]);


  const [learningPaths, setLearningPaths] = useState([
    { id: 1, course: "Advanced React", provider: "Udemy", progress: 70 },
    { id: 2, course: "Python for Data Science", provider: "Coursera", progress: 50 },
    { id: 3, course: "Machine Learning A-Z", provider: "Kaggle", progress: 30 },
    { id: 4, course: "UI/UX Design Essentials", provider: "Skillshare", progress: 60 },
    { id: 5, course: "AWS Cloud Practitioner", provider: "AWS Training", progress: 40 },
    { id: 6, course: "Full-Stack Web Development", provider: "Codecademy", progress: 20 },
    { id: 7, course: "Introduction to Cybersecurity", provider: "edX", progress: 80 },
    { id: 8, course: "Data Visualization with D3.js", provider: "Pluralsight", progress: 10 },
  ]);


  const [recommendedJobs, setRecommendedJobs] = useState([]);

  const base_url = "http://localhost:5000";

  // Auth Check Effect
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/user-signup");
          return;
        }

        // Log decoded token data to show user-specific information
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        console.log('Current user ID:', tokenData.userId);

        // Check if token is expired
        if (tokenData.exp * 1000 < Date.now()) {
          console.log('Token expired, logging out');
          handleLogout();
          return;
        }

        // Fetch user profile with error handling and retry logic
        const fetchWithRetry = async (url, options, retries = 3) => {
          try {
            const response = await axios.get(url, options);
            return response.data;
          } catch (error) {
            if (retries > 0 && error.response?.status === 429) {
              // Wait for 1 second before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              return fetchWithRetry(url, options, retries - 1);
            }
            throw error;
          }
        };

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all user data in parallel
        const [profileData, tasksData, learningPathsData] = await Promise.all([
          fetchWithRetry(`${base_url}/api/user/profile`, { headers }),
          fetchWithRetry(`${base_url}/api/user/tasks`, { headers }),
          fetchWithRetry(`${base_url}/api/user/learning-paths`, { headers })
        ]);

        console.log('Fetched user-specific data:', {
          profile: profileData,
          tasks: tasksData,
          learningPaths: learningPathsData
        });

        // Update state with fetched data
        setTasks(tasksData);
        setLearningPaths(learningPathsData);

        // Update user profile data with validation
        if (profileData && typeof profileData === 'object') {
          setUserProfile({
            name: profileData.name || 'Unknown User',
            email: profileData.email || '',
            skills: Array.isArray(profileData.skills) ? profileData.skills : [],
            profilePicture: profileData.profilePicture || null,
            recentActivity: Array.isArray(profileData.recentActivity) ? profileData.recentActivity : []
          });
        } else {
          console.error('Invalid profile data received:', profileData);
          throw new Error('Invalid profile data');
        }

      } catch (error) {
        console.error("Error fetching user data:", error);

        if (error.response?.status === 401) {
          handleLogout();
          return;
        }

        // Show error notification to user
        setError('Failed to load dashboard data. Please refresh the page or contact support.');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch Jobs Effect
  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const response = await fetch(`${base_url}/api/company/get-jobs`);
        const data = await response.json();
        if (Array.isArray(data.jobs)) {
          setRecommendedJobs(data.jobs);
        } else {
          console.error("Invalid data structure: Expected an array of jobs", data);
          setRecommendedJobs([]);
        }
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
        setRecommendedJobs([]);
      }
    };

    fetchRecommendedJobs();
  }, []);

  // Session timeout handler
  useEffect(() => {
    let timeoutId;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
        toast.error("Session expired. Please login again.");
      }, SESSION_TIMEOUT);
    };

    // Add event listeners for user activity
    const handleUserActivity = () => {
      resetTimeout();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    // Initial timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };
  }, []);

  // Event Handlers
  const handleDropdownToggle = () => setIsDropdownOpen(!isDropdownOpen);

  const handleTaskCompletion = async (taskId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `${base_url}/api/user/tasks/${taskId}`,
        { status: "Completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status: "Completed" } : task
      );
      setTasks(updatedTasks);
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleLearningPathContinue = async (pathId) => {
    try {
      const token = localStorage.getItem("authToken");
      const path = learningPaths.find((p) => p.id === pathId);
      const newProgress = Math.min(path.progress + 10, 100);

      await axios.put(
        `${base_url}/api/user/learning-paths/${pathId}`,
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPaths = learningPaths.map((path) =>
        path.id === pathId ? { ...path, progress: newProgress } : path
      );
      setLearningPaths(updatedPaths);
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const handleJobApplication = (jobId) => {
    const job = recommendedJobs.find((job) => job.id === jobId);
    setJobApplicationStatus(`You have applied for the job: ${job.title}`);
  };

  const handleLogout = () => {
    // Clear all user-specific data
    setUserProfile(initialProfileState);
    setTasks([]);
    setLearningPaths([]);
    setRecommendedJobs([]);
    setJobApplicationStatus(null);

    // Clear session storage and local storage
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // Log the logout event
    console.log('User logged out at:', new Date().toISOString());

    // Navigate to home
    navigate("/");
  };

  // Render Content Based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewSection
            userProfile={userProfile}
            stats={communityStats}
            learningPaths={learningPaths}
          />
        );
      case "profile":
        return <Profile userProfile={userProfile} />;
      case "tasks":
        return (
          <div className="contentio_sectionz">
            <h2>Assigned Tasks</h2>
            <ul className="taskio_listz">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onComplete={handleTaskCompletion}
                />
              ))}
            </ul>
          </div>
        );
      case "learningPaths":
        return (
          <div className="contentio_sectionz">
            <h2>Learning Paths</h2>
            <ul className="learnio_listz">
              {learningPaths.map((path) => (
                <LearningPathItem
                  key={path.id}
                  path={path}
                  onContinue={handleLearningPathContinue}
                />
              ))}
            </ul>
          </div>
        );
      case "recommendedJobs":
        return (
          <div className="contentio_sectionz">
            <h2>Recommended Jobs</h2>
            {recommendedJobs.length === 0 ? (
              <div className="no_jobzio">
                <p>No recommended jobs available.</p>
              </div>
            ) : (
              <ul className="jobio_listz">
                {recommendedJobs.map((job) => (
                  <JobItem
                    key={job.id}
                    job={job}
                    onApply={handleJobApplication}
                  />
                ))}
              </ul>
            )}
            {jobApplicationStatus && (
              <div className="statusio_messagez">{jobApplicationStatus}</div>
            )}
          </div>
        );
      case "achievements":
        return <AchievementsSection achievements={achievements} />;
      case "community":
        return (
          <CommunitySection
            stats={communityStats}
            connections={userProfile.connections || []}
          />
        );
      case "chatbot":
        return (
          <div className="contentio_sectionz chatbot-container">
            <h2>AI Assistant</h2>
            <Chatbot />
          </div>
        );
      default:
        return (
          <div className="contentio_sectionz">
            <h2>Welcome to Your Dashboard</h2>
            <p>Select a section from the sidebar to get started.</p>
          </div>
        );
    }
  };

  return (
    <div className="dashboardio_containerz">
      <aside className="sidebario_navz">
        <div className="sidebario_headerz">
          <h2>User Portal</h2>
        </div>

        <div className="sidebario_menuz">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "profile", label: "Profile", icon: User },
            { id: "tasks", label: "Tasks", icon: CheckSquare },
            { id: "learningPaths", label: "Learning Paths", icon: Book },
            { id: "recommendedJobs", label: "Jobs", icon: Briefcase },
            { id: "achievements", label: "Achievements", icon: Medal },
            { id: "chatbot", label: "AI Assistant", icon: Target }
          ].map((item) => (
            <button
              key={item.id}
              className={`menuz_itemz ${activeTab === item.id ? "activio" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="menuz_iconz" />
              <span>{item.label}</span>
              <ChevronRight className="arrowo_iconz" />
            </button>
          ))}
          <div className="menuz_dividerz"></div>
          <button className="menuz_itemz logouto_btnz" onClick={handleLogout}>
            <LogOut className="menuz_iconz" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="mainio_contentz">
        <header className="dashboardio_headerz">
          <div className="headerio_leftz">
            <h1>Welcome back!</h1>
            <p>Let's continue your professional journey</p>
          </div>

          <div className="headerio_rightz">
            <ProfileDropdown
              userProfile={userProfile}
              isDropdownOpen={isDropdownOpen}
              handleDropdownToggle={handleDropdownToggle}
              navigate={navigate}
              handleLogout={handleLogout}
              setActiveTab={setActiveTab}
            />
          </div>
        </header>

        <section className="heroio_sectionz">
          <DashboardStats />
        </section>

        <section className="dashboardio_contentz">
          {renderContent()}
        </section>
      </main>

      <FloatingAssistant />
    </div>
  );
}
  