import { login, register, getMe, logout } from "../services/auth.api";
import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setuser, loading, setLoading } = context;

  async function handleRegister({ username, email, password }) {
    setLoading(true);
    const data = await register({ username, email, password });
    setuser(data.user);
    setLoading(false);
  }

  async function handleLogin({ username, email, password }) {
    setLoading(true);
    const data = await login({ username, email, password });
    setuser(data.user);
    setLoading(false);
  }

  async function handleGetMe() {
    setLoading(true);
    const data = await getMe();
    setuser(data.user);
    setLoading(false);
  }

  async function handleLogout() {
    setLoading(true);
    await logout();
    setuser(null);
    setLoading(false);
  }



  return {
    user,
    loading,
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
};
