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

      <nav className="sidebar__menu">
        <ul>
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/">
              <span className="icon">🏠</span>
              <span className="text">Bosh sahifa</span>
            </Link>
          </li>
          <li className={isActive("/add-person") ? "active" : ""}>
            <Link to="/add-person">
              <span className="icon">👤</span>
              <span className="text">Ma'lumot qo'shish</span>
            </Link>
          </li>
          <li className={isActive("/in-process") ? "active" : ""}>
            <Link to="/in-process">
              <span className="icon">📋</span>
              <span className="text">Ishlovdagi shaxs ma'lumoti</span>
            </Link>
          </li>
          <li className={isActive("/search") ? "active" : ""}>
            <Link to="/search">
              <span className="icon">🔍</span>
              <span className="text">Qidirish</span>
            </Link>
          </li>
          <li className={isActive("/reports") ? "active" : ""}>
            <Link to="/reports">
              <span className="icon">📊</span>
              <span className="text">Hisobot yuklash</span>
            </Link>
          </li>
        </ul>

        {/* Faqat Super Admin uchun */}
        {user?.role === "SUPER_ADMIN" && (
          <div className="admin-section">
            <div className="section-divider"></div>
            <ul>
              <li className={isActive("/crime-types") ? "active" : ""}>
                <Link to="/crime-types">
                  <span className="icon">⚖️</span>
                  <span className="text">Jinoyat turi</span>
                </Link>
              </li>
              <li className={isActive("/add-admin") ? "active" : ""}>
                <Link to="/add-admin">
                  <span className="icon">👥</span>
                  <span className="text">Inspektor qo'shish</span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </aside>
  );
}
