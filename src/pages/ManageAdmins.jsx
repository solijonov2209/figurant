import { useState, useEffect } from "react";
import { useAuth } from "../app/provider/AuthProvider";
import adminService from "../shared/services/adminService";
import { Pencil, Trash2 } from "lucide-react";
import "./ManageAdmins.css";

export default function ManageAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    login: "",
    password: ""
  });

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAll();
      // Super Admin dan boshqa barcha adminlar
      const filteredAdmins = response.data.filter(admin => admin.id !== user.id);
      setAdmins(filteredAdmins);
    } catch (err) {
      setError("Adminlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (admin) => {
    if (!window.confirm(`${admin.firstName} ${admin.lastName}ni o'chirishni tasdiqlaysizmi?`)) {
      return;
    }

    try {
      await adminService.delete(admin.id, user);
      setSuccess(`${admin.firstName} ${admin.lastName} muvaffaqiyatli o'chirildi`);
      loadAdmins();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "O'chirishda xatolik");
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setEditData({
      login: admin.login,
      password: ""
    });
    setShowEditModal(true);
    setError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validatsiya
    if (!editData.login) {
      setError("Login majburiy");
      return;
    }

    if (editData.password && editData.password.length < 3) {
      setError("Parol kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      const updatedAdmin = {
        ...selectedAdmin,
        login: editData.login,
        ...(editData.password && { password: editData.password })
      };

      await adminService.update(updatedAdmin, user);

      setSuccess(`${selectedAdmin.firstName} ${selectedAdmin.lastName} ma'lumotlari yangilandi`);
      setShowEditModal(false);
      setSelectedAdmin(null);
      loadAdmins();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Ma'lumotlarni yangilashda xatolik");
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setSelectedAdmin(null);
    setEditData({ login: "", password: "" });
    setError("");
  };

  if (loading) {
    return (
      <div className="manage-admins-container">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="manage-admins-container">
      <div className="page-header">
        <h2 className="page-title">Adminlarni Boshqarish</h2>
        <p className="page-subtitle">Jami adminlar: {admins.length}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {admins.length === 0 ? (
        <div className="empty-text">Hozircha boshqa adminlar yo'q</div>
      ) : (
        <div className="admins-list">
          <table className="admins-table">
            <thead>
              <tr>
                <th>№</th>
                <th>F.I.O</th>
                <th>Login</th>
                <th>Lavozim</th>
                <th>Tuman</th>
                <th>Mahalla</th>
                <th>Telefon</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => (
                <tr key={admin.id}>
                  <td>{index + 1}</td>
                  <td>{admin.lastName} {admin.firstName}</td>
                  <td>
                    <span className="login-badge">{admin.login}</span>
                  </td>
                  <td>
                    <span className={`role-badge ${admin.role.toLowerCase()}`}>
                      {getRoleName(admin.role)}
                    </span>
                  </td>
                  <td>{admin.districtName || "-"}</td>
                  <td>{admin.mahallaName || "-"}</td>
                  <td>{admin.phoneNumber}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleEditClick(admin)}
                        title="Tahrirlash"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(admin)}
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adminni Tahrirlash</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="admin-info">
                  <p><strong>F.I.O:</strong> {selectedAdmin?.lastName} {selectedAdmin?.firstName}</p>
                  <p><strong>Lavozim:</strong> {getRoleName(selectedAdmin?.role)}</p>
                </div>

                <div className="form-group">
                  <label>Login:</label>
                  <input
                    type="text"
                    value={editData.login}
                    onChange={(e) => setEditData({ ...editData, login: e.target.value })}
                    placeholder="Login kiriting"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Yangi parol (agar o'zgartirmoqchi bo'lsangiz):</label>
                  <input
                    type="password"
                    value={editData.password}
                    onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                    placeholder="Yangi parol kiriting (ixtiyoriy)"
                    minLength="3"
                  />
                  <small>Bo'sh qoldiring, agar parolni o'zgartirmoqchi bo'lmasangiz</small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Bekor qilish
                </button>
                <button type="submit" className="save-button">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
