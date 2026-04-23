import { useState, useEffect } from "react";
import { createContext } from "react";
import { getMe } from "./services/auth.api";

export const AuthContext = createContext();

export const Authprovider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      
      // Timeout after 5 seconds
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setuser(null);
      }, 5000);

      try {
        const data = await getMe();
        clearTimeout(timeoutId);
        setuser(data.user);
      } catch (e) {
        clearTimeout(timeoutId);
        setuser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setuser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
