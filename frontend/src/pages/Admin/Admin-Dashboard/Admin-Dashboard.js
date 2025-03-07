import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {

  }, [navigate]);

  const handleLogout = () => {
    navigate("/admin-login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="contentio_sectionz">
            <h2>Overview & Analytics</h2>
            <div className="statsio_containerz">
              <div className="statio_cardz">
                <Users className="statio_iconz" />
                <div className="statio_infoz">
                  <h3>1,254</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="statio_cardz">
                <Briefcase className="statio_iconz" />
                <div className="statio_infoz">
                  <h3>237</h3>
                  <p>Active Jobs</p>
                </div>
              </div>

              <div className="statio_cardz">
                <FileCheck className="statio_iconz" />
                <div className="statio_infoz">
                  <h3>45</h3>
                  <p>Assessments</p>
                </div>
              </div>

              <div className="statio_cardz">
                <BookOpen className="statio_iconz" />
                <div className="statio_infoz">
                  <h3>89</h3>
                  <p>Courses</p>
                </div>
              </div>
            </div>

            <section className="recent_activity_sectionz">
              <h3>Recent Activities</h3>
              <ul className="activity_listz">
                <li><strong>Ali Raza</strong> completed an assessment on React.</li>
                <li>New job posted: <strong>Full Stack Developer</strong>.</li>
                <li><strong>Sara Khan</strong> registered for Python Course.</li>
                <li>Course updated: <strong>Advanced Node.js</strong>.</li>
              </ul>
            </section>
          </div>
        );

      case "manage-users":
        return (
          <ManageUsers />
        );

      case "manage-jobs":
        return (
          <ManageJobs />
        );

      case "manage-courses":
        return (
          <ManageCourses />
        );

      default:
        return <div>Select a valid option from the sidebar.</div>;
    }
  };

  return (
    <div className="dashboardio_containerz">
      <aside className="sidebario_navz">
        <div className="sidebario_headerz">
          <h2>Admin Portal</h2>
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
              className={`menuz_itemz ${activeTab === item.tab ? "activio" : ""}`}
              onClick={() => setActiveTab(item.tab)}
            >
              <item.icon className="menuz_iconz" />
              <span>{item.label}</span>
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
            <h1>Admin Dashboard</h1>
            <p>Manage and monitor your platform</p>
          </div>
        </header>

        <section className="dashboardio_contentz">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}
