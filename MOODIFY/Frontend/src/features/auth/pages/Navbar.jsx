import React from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../style/navbar.scss";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const handleLogoutClick = async () => {
    await handleLogout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Moodify</h1>
      </div>
      <div className="navbar-links">
        {user ? (
          <button onClick={handleLogoutClick} className="logout-btn button">
            Logout
          </button>
        ) : (
          <span>Please login</span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;