import { createContext, useContext, useState } from "react";
import adminService from "../../shared/services/adminService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [error, setError] = useState(null);

  const login = async (loginValue, passwordValue) => {
    try {
      setError(null);
      const response = await adminService.login(loginValue, passwordValue);
      const foundUser = response.data;

      localStorage.setItem("isAuth", "true");
      localStorage.setItem("user", JSON.stringify(foundUser));
      localStorage.setItem("role", foundUser.role);

      setUser(foundUser);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


// import { createContext, useContext, useState } from "react";

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const login = (data) => {
//     localStorage.setItem("token", data.token);
//     setUser(data.user);
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//     window.location.href = "/login";
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
