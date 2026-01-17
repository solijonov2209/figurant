import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Hamburger button */}
      <button className="sidebar__toggle" onClick={toggleSidebar}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="sidebar__logo">
        <img src="/logo.png" alt="logo" />
        {!isCollapsed && <span className="logo-text">FIGURANT</span>}
      </div>

      <nav className="sidebar__menu">
        <ul>
          <li className={isActive("/") ? "active" : ""}>
            <Link to="/" title="Bosh sahifa">
              <span className="icon">🏠</span>
              {!isCollapsed && <span className="text">Bosh sahifa</span>}
            </Link>
          </li>
          <li className={isActive("/add-person") ? "active" : ""}>
            <Link to="/add-person" title="Ma'lumot qo'shish">
              <span className="icon">👤</span>
              {!isCollapsed && <span className="text">Ma'lumot qo'shish</span>}
            </Link>
          </li>
          <li className={isActive("/in-process") ? "active" : ""}>
            <Link to="/in-process" title="Ishlovdagi shaxslar">
              <span className="icon">📋</span>
              {!isCollapsed && <span className="text">Ishlovdagi shaxs ma'lumoti</span>}
            </Link>
          </li>
          <li className={isActive("/search") ? "active" : ""}>
            <Link to="/search" title="Qidirish">
              <span className="icon">🔍</span>
              {!isCollapsed && <span className="text">Qidirish</span>}
            </Link>
          </li>
          <li className={isActive("/reports") ? "active" : ""}>
            <Link to="/reports" title="Hisobot yuklash">
              <span className="icon">📊</span>
              {!isCollapsed && <span className="text">Hisobot yuklash</span>}
            </Link>
          </li>
        </ul>

        {/* Faqat Super Admin uchun */}
        {user?.role === "SUPER_ADMIN" && (
          <div className="admin-section">
            <div className="section-divider"></div>
            <ul>
              <li className={isActive("/crime-types") ? "active" : ""}>
                <Link to="/crime-types" title="Jinoyat turi">
                  <span className="icon">⚖️</span>
                  {!isCollapsed && <span className="text">Jinoyat turi</span>}
                </Link>
              </li>
              <li className={isActive("/manage-admins") ? "active" : ""}>
                <Link to="/manage-admins" title="Adminlarni boshqarish">
                  <span className="icon">👥</span>
                  {!isCollapsed && <span className="text">Adminlar</span>}
                </Link>
              </li>
              <li className={isActive("/add-admin") ? "active" : ""}>
                <Link to="/add-admin" title="Inspektor qo'shish">
                  <span className="icon">➕</span>
                  {!isCollapsed && <span className="text">Inspektor qo'shish</span>}
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Profile va Logout */}
      <div className="sidebar__footer">
        <div className="section-divider"></div>
        <ul>
          <li className={isActive("/profile") ? "active" : ""}>
            <Link to="/profile" title="Profile">
              <span className="icon">👨‍💼</span>
              {!isCollapsed && <span className="text">Profile</span>}
            </Link>
          </li>
          <li>
            <button onClick={logout} className="logout-button" title="Chiqish">
              <span className="icon">🚪</span>
              {!isCollapsed && <span className="text">Chiqish</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
