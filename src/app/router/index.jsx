import { Routes, Route } from "react-router-dom";
import Login from "../../pages/Login";
import Dashboard from "../../pages/Dashboard";
import MainLayout from "../../layouts/MainLoyauts"
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
