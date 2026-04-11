import React from "react";
import "../style/login.scss";
import FormGroup from "../components/FormGroup";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  return (
    <main className="login-page">
      <div className="form-container">
        <h1>Login</h1>
        <form>
          <FormGroup label="Email" placeholder="Enter your email" />
          <FormGroup label="password" placeholder="Enter your password" />
          <button className="button" type="submit">
            Login
          </button>
        </form>
        <p>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </main>
  );
};

export default Login;
