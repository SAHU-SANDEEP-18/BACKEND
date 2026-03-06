import React, { use, useState } from "react";
import "../style/form.scss";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";



const Login = () => {
  const { user, loading, handleLogin } = useAuth();
  const navigate = useNavigate()

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async(e)=>{
    e.preventDefault()
    await handleLogin(username,password)
    navigate("/")
  }

  if(loading){
    <main><h1>Loading.....</h1></main>
  }
  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            name="username"
            id="username"
            placeholder="Enter username"
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            name="password"
            id="password"
            placeholder="Enter password"
          />
          <button className="button primary-button" type="submit">
            Login
          </button>
        </form>
        <p>
          Don't have an account ? <Link to={"/register"}>Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
