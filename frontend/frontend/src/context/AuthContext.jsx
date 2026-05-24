import { createContext, useState } from "react";

export const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));

  const login = (access, refresh, userRole, userName) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    localStorage.setItem("role", userRole);
    localStorage.setItem("username", userName);

    setToken(access);
    setRole(userRole);
    setUsername(userName);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    setToken(null);
    setRole(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, role, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;