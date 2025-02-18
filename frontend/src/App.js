import "./App.css";
import ChooseRolePage from "./pages/ChooseRolePage/ChooseRolePage";
import UserSignup from "./pages/UserSignup";
import CompanySignup from "./pages/CompanySignup";
import CompanyDashboard from "./pages/CompanyDashboard/CompanyDashboard";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  // Define the router
  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: (
          <iframe
            src={`${process.env.PUBLIC_URL}/index1.html`} // Path to your index1.html in the public folder
            title="Landing Page"
            width="100%" // Full width of the parent container
            height="100vh" // Full height of the viewport
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
        element: <CompanyDashboard />, // Add route for CompanyDashboard
      },
      {
        path: "/user-dashboard",
        element: <UserDashboard />, // Add route for UserDashboard
      },
    ],
    {
      future: {
        v7_startTransition: true, // Enable startTransition behavior
        v7_relativeSplatPath: true, // Enable relative splat paths
      },
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
