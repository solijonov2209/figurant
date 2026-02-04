import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../app/provider/AuthProvider";
import adminService from "../shared/services/adminService";
import personService from "../shared/services/personService";
import districtService from "../shared/services/districtService";
import { Pencil, Trash2, Users, TrendingUp, BarChart2, X } from "lucide-react";
import "./ManageAdmins.css";

const BAR_COLORS = [
  "#4A90E2", "#50C878", "#FF6B6B", "#FFD93D", "#6C63FF",
  "#FF9F43", "#00D2D3", "#A29BFE", "#FD79A8", "#00CEC9"
];

export default function ManageAdmins() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [allPersons, setAllPersons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mahallas, setMahallas] = useState([]);
  const [districtFilter, setDistrictFilter] = useState("");
  const [mahallaFilter, setMahallaFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ login: "", password: "" });
  const [personsModalAdmin, setPersonsModalAdmin] = useState(null);

  useEffect(() => {
    loadAdmins();
    loadPersons();
    loadDistricts();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAll();
      const filteredAdmins = response.data.filter(admin => admin.id !== user.id);
      setAdmins(filteredAdmins);
    } catch (err) {
      setError("Adminlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPersons = async () => {
    try {
      const response = await personService.getAll(user);
      setAllPersons(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDistricts = async () => {
    try {
      const response = await districtService.getAll();
      setDistricts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMahallas = async (districtId) => {
    try {
      const response = await districtService.getMahallas(districtId);
      setMahallas(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDistrictFilterChange = (e) => {
    const val = e.target.value;
    setDistrictFilter(val);
    setMahallaFilter("");
    if (val) {
      loadMahallas(val);
    } else {
      setMahallas([]);
    }
  };

  // Compute per-admin stats, filtered by tuman/mahalla
  const adminStats = useMemo(() => {
    let filtered = [...allPersons];
    if (districtFilter) {
      filtered = filtered.filter(p => p.districtId === parseInt(districtFilter));
    }
    if (mahallaFilter) {
      filtered = filtered.filter(p => p.mahallaId === parseInt(mahallaFilter));
    }

    const allAdminsList = [user, ...admins];

    return allAdminsList
      .map(admin => ({
        ...admin,
        personCount: filtered.filter(p => p.registeredBy === admin.id).length,
        inProcessCount: filtered.filter(p => p.registeredBy === admin.id && p.inProcess).length
      }))
      .sort((a, b) => b.personCount - a.personCount);
  }, [admins, allPersons, districtFilter, mahallaFilter, user]);

  const maxCount = Math.max(...adminStats.map(a => a.personCount), 1);

  const modalPersons = useMemo(() => {
    if (!personsModalAdmin) return [];
    return allPersons.filter(p => p.registeredBy === personsModalAdmin.id);
  }, [personsModalAdmin, allPersons]);

  const getRoleName = (role) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "JQB_ADMIN": return "JQB Admin";
      case "MAHALLA_INSPECTOR": return "Mahalla Inspektori";
      default: return role;
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`${admin.firstName} ${admin.lastName}ni o'chirishni tasdiqlaysizmi?`)) return;
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
    setEditData({ login: admin.login, password: "" });
    setShowEditModal(true);
    setError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!editData.login) { setError("Login majburiy"); return; }
    if (editData.password && editData.password.length < 3) {
      setError("Parol kamida 3 ta belgidan iborat bo'lishi kerak"); return;
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
        <p className="page-subtitle">Jami adminlar: {admins.length + 1}</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* ===== STATISTIKA BO'LIMI ===== */}
      <div className="stats-section">
        {/* Summary numbers */}
        <div className="summary-row">
          <div className="summary-card">
            <div className="summary-icon summary-icon--blue"><Users size={22} /></div>
            <div className="summary-text">
              <span className="summary-number">{admins.length + 1}</span>
              <span className="summary-label">Jami Adminlar</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon--green"><TrendingUp size={22} /></div>
            <div className="summary-text">
              <span className="summary-number">{allPersons.length}</span>
              <span className="summary-label">Jami Shaxslar</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon summary-icon--orange"><BarChart2 size={22} /></div>
            <div className="summary-text">
              <span className="summary-number">{allPersons.filter(p => p.inProcess).length}</span>
              <span className="summary-label">Ishlovda</span>
            </div>
          </div>
        </div>

        {/* Tuman / Mahalla filtr */}
        <div className="stats-filters">
          <select value={districtFilter} onChange={handleDistrictFilterChange}>
            <option value="">Barcha tumanlar</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select
            value={mahallaFilter}
            onChange={(e) => setMahallaFilter(e.target.value)}
            disabled={!districtFilter}
          >
            <option value="">Barcha mahallalar</option>
            {mahallas.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Grafik: gorizontal barlar */}
        <div className="chart-card">
          <h3 className="chart-title">Admin Bo'yicha Shaxs Soni</h3>
          <div className="bar-chart">
            {adminStats.map((admin, i) => (
              <div className="bar-row" key={admin.id}>
                <div className="bar-label">
                  <span className="bar-name">{admin.lastName} {admin.firstName}</span>
                  <span className={`role-badge ${admin.role.toLowerCase()}`}>{getRoleName(admin.role)}</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(admin.personCount / maxCount) * 100}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length]
                    }}
                  />
                </div>
                <span className="bar-count">{admin.personCount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin stat cards */}
        <div className="admin-cards-grid">
          {adminStats.map((admin, i) => (
            <div className="admin-stat-card" key={admin.id} onClick={() => setPersonsModalAdmin(admin)} role="button" tabIndex={0}>
              <div className="admin-card-top">
                <div className="admin-card-avatar" style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}>
                  {admin.firstName[0]}{admin.lastName[0]}
                </div>
                <div className="admin-card-info">
                  <h4>{admin.lastName} {admin.firstName}</h4>
                  <span className={`role-badge ${admin.role.toLowerCase()}`}>{getRoleName(admin.role)}</span>
                </div>
              </div>

              <div className="admin-card-location">
                <p><strong>Tuman:</strong> {admin.districtName || "Barcha"}</p>
                {admin.mahallaName && <p><strong>Mahalla:</strong> {admin.mahallaName}</p>}
              </div>

              <div className="admin-card-stats">
                <div className="stat-item">
                  <span className="stat-number">{admin.personCount}</span>
                  <span className="stat-label">Kiritgan</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number stat-number--orange">{admin.inProcessCount}</span>
                  <span className="stat-label">Ishlovda</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number stat-number--green">
                    {allPersons.length > 0 ? Math.round((admin.personCount / allPersons.length) * 100) : 0}%
                  </span>
                  <span className="stat-label">Uldushi</span>
                </div>
              </div>

              <div className="admin-card-progress">
                <div
                  className="progress-bar"
                  style={{
                    width: `${allPersons.length > 0 ? (admin.personCount / allPersons.length) * 100 : 0}%`,
                    backgroundColor: BAR_COLORS[i % BAR_COLORS.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ADMIN RO'YXAT JADVALI ===== */}
      <h3 className="section-title">Admin Ro'yxati</h3>
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
                <th>Kiritgan</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => {
                const count = adminStats.find(a => a.id === admin.id)?.personCount ?? 0;
                return (
                  <tr key={admin.id}>
                    <td>{index + 1}</td>
                    <td>{admin.lastName} {admin.firstName}</td>
                    <td><span className="login-badge">{admin.login}</span></td>
                    <td>
                      <span className={`role-badge ${admin.role.toLowerCase()}`}>
                        {getRoleName(admin.role)}
                      </span>
                    </td>
                    <td>{admin.districtName || "-"}</td>
                    <td>{admin.mahallaName || "-"}</td>
                    <td>{admin.phoneNumber}</td>
                    <td><span className="kiritgan-link" onClick={() => setPersonsModalAdmin(admin)}><strong>{count}</strong></span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-button" onClick={() => handleEditClick(admin)} title="Tahrirlash">
                          <Pencil size={16} />
                        </button>
                        <button className="delete-button" onClick={() => handleDelete(admin)} title="O'chirish">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Persons Modal */}
      {personsModalAdmin && (
        <div className="modal-overlay" onClick={() => setPersonsModalAdmin(null)}>
          <div className="modal-content persons-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{personsModalAdmin.lastName} {personsModalAdmin.firstName} — Kiritgan Shaxslar</h3>
              <button className="close-button" onClick={() => setPersonsModalAdmin(null)}><X size={20} /></button>
            </div>
            <div className="modal-body persons-modal-body">
              {modalPersons.length === 0 ? (
                <p className="persons-modal-empty">Bu admin hech qon shaxs kiritganmagan</p>
              ) : (
                <table className="persons-modal-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>F.I.O</th>
                      <th>Tuman</th>
                      <th>Mahalla</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalPersons.map((person, idx) => (
                      <tr key={person.id}>
                        <td>{idx + 1}</td>
                        <td>{person.lastName} {person.firstName} {person.middleName || ""}</td>
                        <td>{person.districtName || "-"}</td>
                        <td>{person.mahallaName || "-"}</td>
                        <td>
                          <div className="persons-modal-status">
                            {person.inProcess && <span className="status-badge status-badge--process">Ishlovda</span>}
                            {person.sudlangan && <span className="status-badge status-badge--sud">Sudlangan</span>}
                            {!person.inProcess && !person.sudlangan && <span className="status-badge status-badge--done">Barikhan</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
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
                <button type="button" className="cancel-button" onClick={closeModal}>Bekor qilish</button>
                <button type="submit" className="save-button">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
