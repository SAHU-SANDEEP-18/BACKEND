import { createBrowserRouter, Navigate } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/chat/pages/Dashboard";
import SharedChat from "../features/chat/pages/SharedChat";
import Protected from "../features/auth/components/Protected";
import AppLayout from "./AppLayout";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (
          <Protected>
            <Dashboard />
          </Protected>
        ),
      },
      {
        path: "/dashboard",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/shared/:shareId",
        element: <SharedChat />,
      },
    ],
  },
]);
