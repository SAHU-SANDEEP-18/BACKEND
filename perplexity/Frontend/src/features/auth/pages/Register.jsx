import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import Loading from "../../../components/Loading";
import { THEMES } from "../../../config/themes";
import PortalButton from "../../../components/Portalbutton";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const theme = useSelector((state) => state.theme.theme);
  const t = THEMES[theme] || THEMES.teal;

  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleRegister({ username, email, password });
    if (result?.success) {
      navigate("/login");
    }
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <Loading message="Creating your account..." />;
  }

  return (
    <section
      className="min-h-screen px-4 py-10 text-zinc-100 sm:px-6 lg:px-8"
      style={{ backgroundColor: t.bg }}
    >
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div
          className="w-full max-w-md rounded-2xl bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur"
          style={{ border: `1px solid ${t.primary}66` }}
        >
          <h1 className="text-3xl font-bold" style={{ color: t.primary }}>Create account</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Register with your username, email, and password.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-600/40 bg-red-950/20 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition"
                style={{ "--tw-ring-color": t.primary }}
                onFocus={(e) => {
                  e.target.style.borderColor = t.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${t.primary}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                  e.target.style.boxShadow = "";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition"
                onFocus={(e) => {
                  e.target.style.borderColor = t.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${t.primary}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                  e.target.style.boxShadow = "";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-zinc-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition"
                onFocus={(e) => {
                  e.target.style.borderColor = t.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${t.primary}40`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "";
                  e.target.style.boxShadow = "";
                }}
              />
            </div>

            <PortalButton
              text="REGISTER"
              bgColor={t.primary}
              arrowBg={t.dark}
              textColor={t.textOn}
              arrowColor={t.textOn}
              dividerColor="rgba(255,255,255,0.25)"
              width="100%"
              onClick={handleSubmit}
            />
          </form>

          <p className="mt-6 text-center text-sm text-zinc-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold transition"
              style={{ color: t.primary }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;
