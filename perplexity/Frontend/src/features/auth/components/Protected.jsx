import React from "react";
import { useSelector } from "react-redux";
import Loading from "../../../components/Loading";
import { Navigate } from "react-router";

const Protected = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const initialized = useSelector((state) => state.auth.initialized);

  if (!initialized) {
    return null
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children;
};

export default Protected;
