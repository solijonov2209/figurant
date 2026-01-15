import { Routes, Route } from "react-router-dom";
import Login from "../../pages/Login";
import Dashboard from "../../pages/Dashboard";
import AddPerson from "../../pages/AddPerson";
import InProcess from "../../pages/InProcess";
import Search from "../../pages/Search";
import Reports from "../../pages/Reports";
import AddAdmin from "../../pages/AddAdmin";
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
        <Route path="add-person" element={<AddPerson />} />
        <Route path="in-process" element={<InProcess />} />
        <Route path="search" element={<Search />} />
        <Route path="reports" element={<Reports />} />
        <Route path="add-admin" element={<AddAdmin />} />
      </Route>
    </Routes>
  );
}
