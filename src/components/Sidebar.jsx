import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="/logo.png" alt="logo" />
      </div>

      <ul className="sidebar__menu">
        <li className={isActive("/") ? "active" : ""}>
          <Link to="/">Bosh sahifa</Link>
        </li>
        <li className={isActive("/add-person") ? "active" : ""}>
          <Link to="/add-person">Ma'lumot qo'shish</Link>
        </li>
        <li className={isActive("/in-process") ? "active" : ""}>
          <Link to="/in-process">Ishlovdagi shaxslar</Link>
        </li>
        <li className={isActive("/search") ? "active" : ""}>
          <Link to="/search">Qidirish</Link>
        </li>
        <li className={isActive("/reports") ? "active" : ""}>
          <Link to="/reports">Hisobot yuklash</Link>
        </li>
      </ul>

      {/* Faqat Super Admin uchun */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="sidebar__bottom">
          <Link to="/add-admin">inspektor qo'shish</Link>
        </div>
      )}
    </aside>
  );
}
