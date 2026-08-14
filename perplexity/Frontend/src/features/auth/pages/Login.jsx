import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../hook/useAuth";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import Loading from "../../../components/Loading";
import PortalButton from "../../../components/Portalbutton";
import { useToast } from "../../../components/CustomToast";
import { THEMES } from "../../../config/themes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);
  const theme = useSelector((state) => state.theme.theme);
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const t = THEMES[theme] || THEMES.teal;

  const { handleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();

    const payload = {
      email,
      password,
    };

    const result = await handleLogin(payload);
    if (result?.success) {
      toast.success("Logged in.");
      navigate(redirect);
      return;
    }

    if (result === null) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  if (!loading && user) {
    return <Navigate to={redirect} replace />;
  }

  if (loading) {
    return <Loading message="Verifying your login..." />;
  }

  return (
    <section
      className="min-h-screen px-4 py-10 text-zinc-100 sm:px-6 lg:px-8"
      style={{ backgroundColor: t.bg }}
    >
      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <div
          className="w-full max-w-md rounded-2xl border p-8 shadow-2xl shadow-black/50 backdrop-blur"
          style={{ borderColor: `${t.primary}66`, backgroundColor: t.sidebar }}
        >
          <h1 className="text-3xl font-bold" style={{ color: t.primary }}>
            Welcome Back
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Sign in with your email and password.
          </p>

          <form onSubmit={submitForm} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border bg-red-950/20 p-4 text-sm"
                style={{ borderColor: 'rgba(248,113,113,0.4)', color: '#fecaca' }}>
                {error}
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}
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
                className="w-full rounded-lg border px-4 py-3 text-zinc-100 outline-none ring-0 transition"
                style={{
                  borderColor: `${t.primary}55`,
                  backgroundColor: t.bg,
                  color: '#f8fafc',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
                style={{ color: 'rgba(255,255,255,0.8)' }}
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
                className="w-full rounded-lg border px-4 py-3 text-zinc-100 outline-none ring-0 transition"
                style={{
                  borderColor: `${t.primary}55`,
                  backgroundColor: t.bg,
                  color: '#f8fafc',
                }}
              />
            </div>

            <PortalButton
              text="LOG IN"
              bgColor={t.primary}
              arrowBg={t.dark}
              textColor={t.textOn}
              arrowColor={t.textOn}
              dividerColor="rgba(255,255,255,0.25)"
              width="100%"
              onClick={submitForm}
            />
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold transition"
              style={{ color: t.primary }}
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
