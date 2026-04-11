import { useState } from "react";
import { createContext } from "react";

export const AuthContext = createContext();

export const Authprovider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);

  return(
    <AuthContext.Provider value={{user, setuser,loading, setLoading}}>
        {children}
    </AuthContext.Provider>
  )
};
