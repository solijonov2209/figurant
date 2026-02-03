import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import crimeCategoryService from "../shared/services/crimeCategoryService";
import crimeTypeService from "../shared/services/crimeTypeService";
import "./CrimeTypes.css";

export default function CrimeTypes() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role !== "SUPER_ADMIN") {
      navigate("/");
    }
  }, [user, navigate]);

  const [categories, setCategories] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal: modalType = "category" | "type"
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("category");
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", categoryId: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, typeRes] = await Promise.all([
        crimeCategoryService.getAll(),
        crimeTypeService.getAll()
      ]);
      setCategories(catRes.data);
      setCrimeTypes(typeRes.data);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Turkum modal ---
  const openCategoryModal = (category = null) => {
    setModalType("category");
    setEditing(category);
    setFormData({ name: category ? category.name : "", categoryId: null });
    setShowModal(true);
    setError("");
  };

  // --- Jinoyat turi modal ---
  const openTypeModal = (categoryId, type = null) => {
    setModalType("type");
    setEditing(type);
    setFormData({ name: type ? type.name : "", categoryId });
    setShowModal(true);
    setError("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ name: "", categoryId: null });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!formData.name.trim()) {
        throw new Error("Nom kiriting");
      }

      if (modalType === "category") {
        if (editing) {
          await crimeCategoryService.update(editing.id, { name: formData.name }, user);
          setSuccess("Turkum yangilandi!");
        } else {
          await crimeCategoryService.create({ name: formData.name }, user);
          setSuccess("Turkum qo'shildi!");
        }
      } else {
        if (editing) {
          await crimeTypeService.update(editing.id, { name: formData.name }, user);
          setSuccess("Jinoyat turi yangilandi!");
        } else {
          await crimeTypeService.create({ name: formData.name, categoryId: formData.categoryId }, user);
          setSuccess("Jinoyat turi qo'shildi!");
        }
      }

      await loadData();
      setTimeout(() => { closeModal(); }, 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Delete handlers ---
  const handleDeleteCategory = async (id) => {
    if (!confirm("Bu turkumni o'chirish barcha uning jinoyat turlarini ham o'chiradi. Davom etmoqchimisiz?")) return;

    try {
      await crimeCategoryService.delete(id, user);
      // Turkumga tegishli jinoyat turlarini ham o'chir
      const typesToDelete = crimeTypes.filter(t => t.categoryId === id);
      for (const t of typesToDelete) {
        await crimeTypeService.delete(t.id, user);
      }
      setSuccess("Turkum o'chirildi!");
      await loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteType = async (id) => {
    if (!confirm("Bu jinoyat turini o'chirmoqchimisiz?")) return;

    try {
      await crimeTypeService.delete(id, user);
      setSuccess("Jinoyat turi o'chirildi!");
      await loadData();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (user?.role !== "SUPER_ADMIN") return null;

  if (loading) {
    return (
      <div className="crime-types-container">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="crime-types-container">
      <div className="page-header">
        <h2 className="page-title">Jinoyat turkumlari va turlari</h2>
        <button className="add-button" onClick={() => openCategoryModal()}>
          ➕ Yangi turkum
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>Hozircha turkumlar yo'q. Yangi turkum qo'shish uchun yuqoridagi tugmani basing.</p>
        </div>
      ) : (
        <div className="categories-list">
          {categories.map((category) => {
            const typesInCategory = crimeTypes.filter(t => t.categoryId === category.id);

            return (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <h3 className="category-name">{category.name}</h3>
                  <div className="category-actions">
                    <button className="btn-add-type" onClick={() => openTypeModal(category.id)}>
                      ➕
                    </button>
                    <button className="edit-button" onClick={() => openCategoryModal(category)}>
                      ✏️
                    </button>
                    <button className="delete-button" onClick={() => handleDeleteCategory(category.id)}>
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="types-list">
                  {typesInCategory.length === 0 ? (
                    <p className="empty-types">Bu turkumda jinoyat turlari yo'q</p>
                  ) : (
                    typesInCategory.map((type, index) => (
                      <div key={type.id} className="type-row">
                        <span className="type-number">{index + 1}.</span>
                        <span className="type-name">{type.name}</span>
                        <div className="type-actions">
                          <button className="edit-button" onClick={() => openTypeModal(category.id, type)}>
                            ✏️
                          </button>
                          <button className="delete-button" onClick={() => handleDeleteType(type.id)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {modalType === "category"
                  ? (editing ? "Turkumni tahrirlash" : "Yangi turkum qo'shish")
                  : (editing ? "Jinoyat turini tahrirlash" : "Yangi jinoyat turi qo'shish")}
              </h3>
              <button className="close-button" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{modalType === "category" ? "Turkum nomi *" : "Jinoyat turi nomi *"}</label>
                  <input
                    type="text"
                    placeholder={modalType === "category" ? "Masalan: Mol-mulkka qaydli jinoyatlar" : "Masalan: O'g'irlik"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Bekor qilish
                </button>
                <button type="submit" className="save-button">
                  {editing ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
