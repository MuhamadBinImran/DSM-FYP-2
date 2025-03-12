import "./App.css";
import ChooseRolePage from "./pages/ChooseRolePage/ChooseRolePage";
import UserSignup from "./pages/UserSignup";
import CompanySignup from "./pages/CompanySignup";
import CompanyDashboard from "./pages/CompanyDashboard/CompanyDashboard";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import Profile from "./pages/UserProfile/Profile"; 
import Admin from "./pages/Admin/Admin-Login/Admin-Login";
import AdminDashboard from "./pages/Admin/Admin-Dashboard/Admin-Dashboard";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Enhanced Protected Route wrapper component
const ProtectedRoute = ({ element, requiredRole = null }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = () => {
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Decode token to check expiration and role
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token is expired
        if (tokenData.exp * 1000 < Date.now()) {
          console.log('Token expired, logging out');
          localStorage.removeItem("authToken");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Set user role based on token data
        if (tokenData.role === 'admin') {
          setUserRole('admin');
        } else if (tokenData.companyName) {
          setUserRole('company');
        } else {
          setUserRole('user');
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem("authToken");
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect based on required role
    if (requiredRole === 'admin') {
      return <Navigate to="/admin-login" replace />;
    } else if (requiredRole === 'company') {
      return <Navigate to="/company-signup" replace />;
    } else {
      return <Navigate to="/user-signup" replace />;
    }
  }

  // If a specific role is required and user's role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    if (userRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (userRole === 'company') {
      return <Navigate to="/company-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return element;
};

// Admin Protected Route with specific admin role check
const AdminProtectedRoute = ({ element }) => (
  <ProtectedRoute element={element} requiredRole="admin" />
);

// Company Protected Route with specific company role check
const CompanyProtectedRoute = ({ element }) => (
  <ProtectedRoute element={element} requiredRole="company" />
);

// User Protected Route with specific user role check
const UserProtectedRoute = ({ element }) => (
  <ProtectedRoute element={element} requiredRole="user" />
);

function App() {
  // Define the router with role-specific protected routes
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <iframe
            src={`${process.env.PUBLIC_URL}/index1.html`}
            title="Landing Page"
            width="100%"
            height="100vh"
            frameBorder="0"
            style={{
              border: "none",
              display: "block",
              width: "100%",
              height: "100vh",
            }}
          />
        ),
      },
      {
        path: "/choose-role",
        element: <ChooseRolePage />,
      },
      {
        path: "/user-signup",
        element: <UserSignup />,
      },
      {
        path: "/company-signup",
        element: <CompanySignup />,
      },
      {
        path: "/company-dashboard",
        element: <CompanyProtectedRoute element={<CompanyDashboard />} />,
      },
      {
        path: "/user-dashboard",
        element: <UserProtectedRoute element={<UserDashboard />} />,
      },
      {
        path: "/profile",
        element: <UserProtectedRoute element={<Profile />} />,
      },
      {
        path: "/admin-login",
        element: <Admin />,
      },
      {
        path: "/admin-dashboard",
        element: <AdminProtectedRoute element={<AdminDashboard />} />,
      },
      // Add a catch-all redirect
      {
        path: "*",
        element: <Navigate to="/choose-role" replace />,
      },
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      },
    }
  );

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
