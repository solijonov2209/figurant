import { createContext, useContext, useState } from "react";
import authService from "../../shared/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await authService.login(username, password);

      if (!response.success) {
        setError(response.error);
        return false;
      }

      setUser(response.data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      // Logout xatosi bo'lsa ham foydalanuvchini login sahifasiga yo'naltirish
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
