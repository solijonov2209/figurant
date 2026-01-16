import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import crimeTypeService from "../shared/services/crimeTypeService";
import "./CrimeTypes.css";

export default function CrimeTypes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Agar Super Admin bo'lmasa, dashboard ga qaytarish
  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") {
      navigate("/");
    }
  }, [user, navigate]);

  const [crimeTypes, setCrimeTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCrimeType, setEditingCrimeType] = useState(null);
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    loadCrimeTypes();
  }, []);

  const loadCrimeTypes = async () => {
    try {
      setLoading(true);
      const response = await crimeTypeService.getAll();
      setCrimeTypes(response.data);
    } catch (err) {
      setError("Jinoyat turlarini yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (crimeType = null) => {
    setEditingCrimeType(crimeType);
    setFormData({ name: crimeType ? crimeType.name : "" });
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCrimeType(null);
    setFormData({ name: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!formData.name.trim()) {
        throw new Error("Jinoyat turi nomini kiriting");
      }

      if (editingCrimeType) {
        // Tahrirlash
        await crimeTypeService.update(editingCrimeType.id, formData, user);
        setSuccess("Jinoyat turi muvaffaqiyatli yangilandi!");
      } else {
        // Yangi qo'shish
        await crimeTypeService.create(formData, user);
        setSuccess("Jinoyat turi muvaffaqiyatli qo'shildi!");
      }

      await loadCrimeTypes();

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham bu jinoyat turini o'chirmoqchimisiz?")) {
      return;
    }

    try {
      setError("");
      await crimeTypeService.delete(id, user);
      setSuccess("Jinoyat turi muvaffaqiyatli o'chirildi!");
      await loadCrimeTypes();

      setTimeout(() => {
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user?.role !== "SUPER_ADMIN") {
    return null;
  }

  if (loading && crimeTypes.length === 0) {
    return (
      <div className="crime-types-container">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="crime-types-container">
      <div className="page-header">
        <h2 className="page-title">Jinoyat turlari</h2>
        <button className="add-button" onClick={() => handleOpenModal()}>
          ➕ Yangi jinoyat turi qo'shish
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="crime-types-list">
        {crimeTypes.length === 0 ? (
          <p className="empty-text">Hozircha jinoyat turlari yo'q</p>
        ) : (
          <table className="crime-types-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Jinoyat turi</th>
                <th>Qo'shilgan sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {crimeTypes.map((crimeType, index) => (
                <tr key={crimeType.id}>
                  <td>{index + 1}</td>
                  <td>{crimeType.name}</td>
                  <td>{new Date(crimeType.createdAt).toLocaleDateString('uz-UZ')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => handleOpenModal(crimeType)}
                        title="Tahrirlash"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(crimeType.id)}
                        title="O'chirish"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCrimeType ? "Jinoyat turini tahrirlash" : "Yangi jinoyat turi qo'shish"}</h3>
              <button className="close-button" onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Jinoyat turi nomi *</label>
                  <input
                    type="text"
                    placeholder="Masalan: O'g'irlik, Talonchilik..."
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  Bekor qilish
                </button>
                <button type="submit" className="save-button">
                  {editingCrimeType ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
