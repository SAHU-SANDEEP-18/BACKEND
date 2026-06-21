import { useDispatch } from "react-redux";
import { register, login, getMe } from "../services/auth.api";
import { setUser, setLoading, setError, setInitialized } from "../auth.slice";

export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await register({ username, email, password });
      return data;
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      return data;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      return null;
    } finally {
      dispatch(setLoading(false));
    }   
  }

  async function handleGetMe() {
    try {
        const data = await getMe()
        dispatch(setUser(data.user))
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to fetch user"))
    } finally {
        dispatch(setInitialized(true))
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe
  }
}
