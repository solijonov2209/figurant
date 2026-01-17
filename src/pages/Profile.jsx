import { useState } from "react";
import { useAuth } from "../app/provider/AuthProvider";
import adminService from "../shared/services/adminService";
import "./Profile.css";

export default function Profile() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const getRoleName = (role) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "JQB_ADMIN":
        return "JQB Admin";
      case "MAHALLA_INSPECTOR":
        return "Mahalla Inspektori";
      default:
        return role;
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validatsiya
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Barcha maydonlarni to'ldiring");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Yangi parollar mos emas");
      return;
    }

    if (passwordData.newPassword.length < 3) {
      setError("Yangi parol kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    if (passwordData.currentPassword !== user.password) {
      setError("Joriy parol noto'g'ri");
      return;
    }

    try {
      setLoading(true);

      // Parolni yangilash
      const updatedUser = {
        ...user,
        password: passwordData.newPassword
      };

      await adminService.update(updatedUser, user);

      // LocalStorage ni yangilash
      const currentUser = JSON.parse(localStorage.getItem("user"));
      currentUser.password = passwordData.newPassword;
      localStorage.setItem("user", JSON.stringify(currentUser));

      setSuccess("Parol muvaffaqiyatli o'zgartirildi!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setShowPasswordForm(false);

      // 2 sekunddan keyin xabarni o'chirish
      setTimeout(() => {
        setSuccess("");
      }, 3000);

    } catch (err) {
      setError(err.message || "Parolni o'zgartirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <span className="avatar-icon">👨‍💼</span>
        </div>
        <div className="profile-title">
          <h2>Profile Ma'lumotlari</h2>
          <p className="profile-role">{getRoleName(user?.role)}</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-info">
        <div className="info-group">
          <label>Familiya:</label>
          <p>{user?.lastName}</p>
        </div>

        <div className="info-group">
          <label>Ism:</label>
          <p>{user?.firstName}</p>
        </div>

        <div className="info-group">
          <label>Login:</label>
          <p>{user?.login}</p>
        </div>

        <div className="info-group">
          <label>Telefon raqam:</label>
          <p>{user?.phoneNumber}</p>
        </div>

        <div className="info-group">
          <label>Lavozim:</label>
          <p>{getRoleName(user?.role)}</p>
        </div>

        {user?.districtName && (
          <div className="info-group">
            <label>Tuman:</label>
            <p>{user.districtName}</p>
          </div>
        )}

        {user?.mahallaName && (
          <div className="info-group">
            <label>Mahalla:</label>
            <p>{user.mahallaName}</p>
          </div>
        )}

        <div className="info-group">
          <label>Ro'yxatdan o'tgan sana:</label>
          <p>{new Date(user?.createdAt).toLocaleString('uz-UZ')}</p>
        </div>
      </div>

      {/* Faqat Super Admin uchun parol o'zgartirish */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="password-section">
          <button
            className="change-password-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? "Bekor qilish" : "Parolni o'zgartirish"}
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label>Joriy parol:</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Joriy parolingizni kiriting"
                  required
                />
              </div>

              <div className="form-group">
                <label>Yangi parol:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Yangi parol kiriting"
                  required
                  minLength="3"
                />
              </div>

              <div className="form-group">
                <label>Yangi parolni tasdiqlang:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Yangi parolni qayta kiriting"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
