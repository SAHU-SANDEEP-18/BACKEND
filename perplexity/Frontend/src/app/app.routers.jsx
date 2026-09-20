import { createBrowserRouter, Navigate } from "react-router";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import SharedChat from "../features/chat/pages/SharedChat";
import JoinChat from "../features/chat/components/JoinChat";
import AppLayout from "./AppLayout";
import Landing from "./Landing";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Landing />,
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
        path: "/join/:token",
        element: <JoinChat />,
      },
      {
        path: "/shared/:shareId",
        element: <SharedChat />,
      },
    ],
  },
]);