import React, { useState, useEffect } from "react";

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
  TrendingUp
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import "../UserDashboard/userdcss/userd.css";
import Chatbot from "../CHATBOT/Chatbot";






const userProfile = {
  name: "John Doe",
  email: "john.doe@example.com",
  skills: ["JavaScript", "React", "Python"],
  profilePicture: "./man.png",
  recentActivity: [
    "Completed React Certification",
    "Applied for Frontend Developer role at TechCorp",
  ],
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
}) => (
  <div className="profilio_dropdownz">
    <div className="profilio_triggerz" onClick={handleDropdownToggle}>
      <img
        src={userProfile.profilePicture}
        alt="Profile"
        className="profilio_picz"
      />
      <span className="profilio_namez">{userProfile.name}</span>
    </div>
    {isDropdownOpen && (
      <div className="dropdownio_menuz">
        <div className="dropdownio_headerz">
          <div className="dropdownio_profilio_infoz">
            <p className="dropdownio_emailz">{userProfile.email}</p>
          </div>
        </div>
        <div className="dropdownio_dividerz"></div>
        <button onClick={() => navigate("/profile")}>View Profile</button>

        <button onClick={() => navigate("/settings")}>Account Settings</button>
        <div className="dropdownio_dividerz"></div>
        <button className="logouto_btnz" onClick={handleLogout}>
          <LogOut className="iconz" />
          Logout
        </button>
      </div>
    )}
  </div>
);

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

// Main Dashboard Component
export default function UserDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tasks");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(2);
  const [jobApplicationStatus, setJobApplicationStatus] = useState(null);

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
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/user-signup");
    }
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

  // Event Handlers
  const handleDropdownToggle = () => setIsDropdownOpen(!isDropdownOpen);

  const handleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: "Completed" } : task
    );
    setTasks(updatedTasks);
  };

  const handleLearningPathContinue = (pathId) => {
    const updatedPaths = learningPaths.map((path) =>
      path.id === pathId ? { ...path, progress: Math.min(path.progress + 10, 100) } : path
    );
    setLearningPaths(updatedPaths);
  };

  const handleJobApplication = (jobId) => {
    const job = recommendedJobs.find((job) => job.id === jobId);
    setJobApplicationStatus(`You have applied for the job: ${job.title}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // Render Content Based on Active Tab
  const renderContent = () => {
    switch (activeTab) {
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
        case "chatbot":
  return (
    <div className="contentio_sectionz chatbot-container">
      <h2>AI Chatbot Assistant</h2>
      <Chatbot />
    </div>
  );
      default:
        return <div>Invalid tab selected</div>;
    }
  };

  return (
    <div className="dashboardio_containerz">
      <aside className="sidebario_navz">
        <div className="sidebario_headerz">
          <h2>User Portal</h2>
        </div>
        
        <div className="sidebario_menuz">
          {["tasks", "learningPaths", "recommendedJobs", "chatbot"].map((tab, index) => (
            <button
            key={index}
            className={`menuz_itemz ${activeTab === tab ? "activio" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "tasks" && <CheckSquare className="menuz_iconz" />}
            {tab === "learningPaths" && <Book className="menuz_iconz" />}
            {tab === "recommendedJobs" && <Target className="menuz_iconz" />}
            {tab === "chatbot" && <User className="menuz_iconz" />} 
            <span>
              {tab === "tasks"
                ? "Tasks"
                : tab === "learningPaths"
                ? "Learning Paths"
                : tab === "recommendedJobs"
                ? "Jobs"
                : "Chatbot"} {/* ✅ Fix menu name */}
            </span>
            <ChevronRight className="arrowo_iconz" />
          </button>
          
          ))}
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
            <div className="notifio_bellz">

            </div>
            
            <ProfileDropdown
              userProfile={userProfile}
              isDropdownOpen={isDropdownOpen}
              handleDropdownToggle={handleDropdownToggle}
              navigate={navigate}
              handleLogout={handleLogout}
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
    </div>
  );
}