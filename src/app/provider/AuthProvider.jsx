import { createContext, useContext, useState } from "react";
import { fakeUsers } from "../../shared/utils/fakeUser";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = (loginValue, passwordValue) => {
    const foundUser = fakeUsers.find(
      (u) =>
        u.login === loginValue &&
        u.password === passwordValue
    );

    if (!foundUser) {
      return false;
    }

    localStorage.setItem("isAuth", "true");
    localStorage.setItem("user", JSON.stringify(foundUser));
    localStorage.setItem("role", foundUser.role);

    setUser(foundUser);
    return true;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
