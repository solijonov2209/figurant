import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import adminService from "../shared/services/adminService";
import districtService from "../shared/services/districtService";
import { Shield, User } from "lucide-react";
import "./AddAdmin.css";

export default function AddAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Agar Super Admin yoki JQB Admin bo'lmasa, dashboard ga qaytarish
  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "JQB_ADMIN") {
      navigate("/");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    role: user?.role === "JQB_ADMIN" ? "MAHALLA_INSPECTOR" : "JQB_ADMIN",
    districtId: user?.role === "JQB_ADMIN" ? user.districtId : "",
    mahallaId: ""
  });

  const [districts, setDistricts] = useState([]);
  const [mahallas, setMahallas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDistricts();
    // JQB Admin uchun avtomatik mahallalarni yuklash
    if (user?.role === "JQB_ADMIN" && user?.districtId) {
      loadMahallas(user.districtId);
    }
  }, [user]);

  const loadDistricts = async () => {
    try {
      const response = await districtService.getAll();
      setDistricts(response.data);
    } catch (err) {
      setError("Tumanlarni yuklashda xatolik: " + err.message);
    }
  };

  const loadMahallas = async (districtId) => {
    try {
      const response = await districtService.getMahallas(districtId);
      setMahallas(response.data);
    } catch (err) {
      setError("Mahallalarni yuklashda xatolik: " + err.message);
    }
  };

  const handleDistrictChange = (e) => {
    const districtId = parseInt(e.target.value);
    setFormData({ ...formData, districtId, mahallaId: "" });
    if (districtId) {
      loadMahallas(districtId);
    } else {
      setMahallas([]);
    }
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      role,
      districtId: "",
      mahallaId: ""
    });
    setMahallas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validatsiya
      if (!formData.login || !formData.password) {
        throw new Error("Login va parol majburiy");
      }

      if (!formData.firstName || !formData.lastName) {
        throw new Error("Ism va Familiya majburiy");
      }

      if (!formData.phoneNumber) {
        throw new Error("Telefon raqami majburiy");
      }

      if (!formData.districtId) {
        throw new Error("Tumanni tanlang");
      }

      if (formData.role === "MAHALLA_INSPECTOR" && !formData.mahallaId) {
        throw new Error("Mahallani tanlang");
      }

      // Tuman va Mahalla nomlarini olish
      const district = districts.find(d => d.id === parseInt(formData.districtId));
      const districtName = district.name;

      let mahallaName = null;
      if (formData.role === "MAHALLA_INSPECTOR") {
        const mahalla = mahallas.find(m => m.id === parseInt(formData.mahallaId));
        mahallaName = mahalla.name;
      }

      // Adminni qo'shish
      const adminData = {
        login: formData.login,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
        districtId: parseInt(formData.districtId),
        districtName: districtName,
        mahallaId: formData.role === "MAHALLA_INSPECTOR" ? parseInt(formData.mahallaId) : null,
        mahallaName: mahallaName
      };

      await adminService.create(adminData, user);

      setSuccess(true);

      // 2 sekunddan keyin formani tozalash
      setTimeout(() => {
        handleReset();
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      login: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      role: "JQB_ADMIN",
      districtId: "",
      mahallaId: ""
    });
    setMahallas([]);
    setError("");
    setSuccess(false);
  };

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "JQB_ADMIN") {
    return null;
  }

  const isJQBAdmin = user?.role === "JQB_ADMIN";
  const pageTitle = isJQBAdmin ? "Mahalla inspektori qo'shish" : "Admin qo'shish";
  const submitButtonText = isJQBAdmin ? "Inspektor qo'shish" : "Admin qo'shish";

  return (
    <div className="add-admin-container">
      <h2 className="page-title">{pageTitle}</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">
        {isJQBAdmin ? "Inspektor muvaffaqiyatli qo'shildi!" : "Admin muvaffaqiyatli qo'shildi!"}
      </div>}

      <form onSubmit={handleSubmit} className="add-admin-form">
        {/* Faqat Super Admin rol tanlaydi */}
        {user?.role === "SUPER_ADMIN" && (
          <div className="form-section">
            <h3>Rol tanlash</h3>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-button ${formData.role === "JQB_ADMIN" ? "active" : ""}`}
                onClick={() => handleRoleChange({ target: { value: "JQB_ADMIN" } })}
              >
                <div className="role-icon"><Shield size={28} /></div>
                <div className="role-name">JQB Admin</div>
                <div className="role-description">Tuman darajasidagi admin</div>
              </button>

              <button
                type="button"
                className={`role-button ${formData.role === "MAHALLA_INSPECTOR" ? "active" : ""}`}
                onClick={() => handleRoleChange({ target: { value: "MAHALLA_INSPECTOR" } })}
              >
                <div className="role-icon"><User size={28} /></div>
                <div className="role-name">Mahalla Inspektori</div>
                <div className="role-description">Mahalla darajasidagi inspektor</div>
              </button>
            </div>
          </div>
        )}

        <div className="form-grid">
          <div className="form-section">
            <h3>Kirish ma'lumotlari</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="password"
                placeholder="Parol"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Shaxsiy ma'lumotlar</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Familiya"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Ism"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="tel"
                placeholder="Telefon raqami (+998901234567)"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Hudud ma'lumotlari</h3>
            <div className="form-row">
              <select
                value={formData.districtId}
                onChange={handleDistrictChange}
                required
                disabled={isJQBAdmin}
              >
                <option value="">Tumanni tanlang</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {(formData.role === "MAHALLA_INSPECTOR" || isJQBAdmin) && (
              <div className="form-row">
                <select
                  value={formData.mahallaId}
                  onChange={(e) => setFormData({ ...formData, mahallaId: e.target.value })}
                  required
                  disabled={!formData.districtId}
                >
                  <option value="">Mahallani tanlang</option>
                  {mahallas.map(mahalla => (
                    <option key={mahalla.id} value={mahalla.id}>
                      {mahalla.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleReset} className="reset-button" disabled={loading}>
            Tozalash
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saqlanmoqda..." : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}
