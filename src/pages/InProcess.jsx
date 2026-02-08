import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import "./InProcess.css";

export default function InProcess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [persons, setPersons] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mahalla inspektor bu sahifaga kira olmaydi
  useEffect(() => {
    if (user?.role === "MAHALLA_INSPECTOR") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const response = await personService.getInProcess(user);
      setPersons(response.data);
      setFilteredPersons(response.data);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Qidiruv filtri
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPersons(persons);
      return;
    }

    const filtered = persons.filter(person => {
      const fullName = `${person.lastName} ${person.firstName} ${person.middleName}`.toLowerCase();
      const passport = `${person.passportSerial}${person.passportNumber}`.toLowerCase();
      const search = searchTerm.toLowerCase();

      return fullName.includes(search) || passport.includes(search);
    });

    setFilteredPersons(filtered);
  }, [searchTerm, persons]);

  const handleRemoveFromProcess = async (personId, e) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!confirm("Haqiqatan ham ishlovdan chiqarmoqchimisiz?")) {
      return;
    }

    try {
      await personService.removeFromProcess(personId, user);
      await loadPersons();
      alert("Ishlovdan chiqarildi");
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="in-process-container">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="in-process-container">
      <div className="page-header">
        <h2 className="page-title">Ishlovdagi shaxslar</h2>
        <p className="page-subtitle">Jami: {persons.length} ta</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Qidiruv */}
      {persons.length > 0 && (
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Ism, familiya yoki pasport orqali qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm("")}>
              ✕
            </button>
          )}
        </div>
      )}

      {persons.length === 0 ? (
        <div className="empty-state">
          <p>Hozircha ishlovdagi shaxslar yo'q</p>
        </div>
      ) : filteredPersons.length === 0 ? (
        <div className="empty-state">
          <p>"{searchTerm}" bo'yicha natija topilmadi</p>
        </div>
      ) : (
        <div className="persons-grid">
          {filteredPersons.map((person) => (
            <div
              key={person.id}
              className="person-card clickable-card"
              onClick={() => navigate(`/person/${person.id}`)}
            >
              <div className="person-card-header">
                <h3>{person.lastName} {person.firstName}</h3>
                <span className="person-id">ID: {person.id}</span>
              </div>

              <div className="person-card-body">
                <div className="person-info">
                  <div className="info-row">
                    <span className="label">F.I.O:</span>
                    <span className="value">
                      {person.lastName} {person.firstName} {person.middleName}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">Tug'ilgan sana:</span>
                    <span className="value">{person.birthDate}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Pasport:</span>
                    <span className="value">
                      {person.passportSerial} {person.passportNumber}
                    </span>
                  </div>

                  <div className="info-row">
                    <span className="label">Tuman:</span>
                    <span className="value">{person.districtName}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Mahalla:</span>
                    <span className="value">{person.mahallaName}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Ishlovga qo'shgan:</span>
                    <span className="value">{person.processedByName}</span>
                  </div>

                  <div className="info-row">
                    <span className="label">Qo'shilgan vaqt:</span>
                    <span className="value">
                      {new Date(person.processedAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </div>

              {user.role === "SUPER_ADMIN" && (
                <div className="person-card-footer">
                  <button
                    className="remove-button"
                    onClick={(e) => handleRemoveFromProcess(person.id, e)}
                  >
                    Ishlovdan chiqarish
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
