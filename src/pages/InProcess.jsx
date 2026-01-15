import { useState, useEffect } from "react";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import "./InProcess.css";

export default function InProcess() {
  const { user } = useAuth();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const response = await personService.getInProcess(user);
      setPersons(response.data);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromProcess = async (personId) => {
    if (!confirm("Haqiqatan ham ishlovdan chiqarmoqchimisiz?")) {
      return;
    }

    try {
      await personService.removeFromProcess(personId, user);
      await loadPersons();
      setSelectedPerson(null);
      alert("Ishlovdan chiqarildi");
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  const handleViewDetails = (person) => {
    setSelectedPerson(person);
  };

  const closeModal = () => {
    setSelectedPerson(null);
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
      <h2 className="page-title">Ishlovdagi shaxslar</h2>

      {error && <div className="error-message">{error}</div>}

      {persons.length === 0 ? (
        <div className="empty-state">
          <p>Hozircha ishlovdagi shaxslar yo'q</p>
        </div>
      ) : (
        <div className="persons-grid">
          {persons.map((person) => (
            <div key={person.id} className="person-card">
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

              <div className="person-card-footer">
                <button
                  className="view-details-button"
                  onClick={() => handleViewDetails(person)}
                >
                  Batafsil
                </button>

                {user.role === "SUPER_ADMIN" && (
                  <button
                    className="remove-button"
                    onClick={() => handleRemoveFromProcess(person.id)}
                  >
                    Ishlovdan chiqarish
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Batafsil ma'lumot */}
      {selectedPerson && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Shaxs haqida to'liq ma'lumot</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {selectedPerson.photoUrl && (
                <div className="modal-photo">
                  <img src={selectedPerson.photoUrl} alt="Rasm" />
                </div>
              )}

              <div className="modal-info">
                <div className="info-section">
                  <h3>Shaxsiy ma'lumotlar</h3>
                  <div className="info-row">
                    <span className="label">Familiya:</span>
                    <span className="value">{selectedPerson.lastName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ism:</span>
                    <span className="value">{selectedPerson.firstName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Otasining ismi:</span>
                    <span className="value">{selectedPerson.middleName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Tug'ilgan sana:</span>
                    <span className="value">{selectedPerson.birthDate}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Hujjat ma'lumotlari</h3>
                  <div className="info-row">
                    <span className="label">Pasport seria:</span>
                    <span className="value">{selectedPerson.passportSerial}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Pasport raqam:</span>
                    <span className="value">{selectedPerson.passportNumber}</span>
                  </div>
                  {selectedPerson.carInfo && (
                    <div className="info-row">
                      <span className="label">Avtomobil:</span>
                      <span className="value">{selectedPerson.carInfo}</span>
                    </div>
                  )}
                </div>

                <div className="info-section">
                  <h3>Manzil</h3>
                  <div className="info-row">
                    <span className="label">Tuman:</span>
                    <span className="value">{selectedPerson.districtName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Mahalla:</span>
                    <span className="value">{selectedPerson.mahallaName}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Qo'shimcha ma'lumot</h3>
                  <p>{selectedPerson.additionalInfo || "Qo'shimcha ma'lumot yo'q"}</p>
                </div>

                <div className="info-section">
                  <h3>Ro'yxatga olish ma'lumoti</h3>
                  <div className="info-row">
                    <span className="label">Ro'yxatga olgan:</span>
                    <span className="value">{selectedPerson.registeredByName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Telefon:</span>
                    <span className="value">{selectedPerson.registeredByPhone}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Ro'yxatga olingan vaqt:</span>
                    <span className="value">
                      {new Date(selectedPerson.registeredAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Ishlov ma'lumoti</h3>
                  <div className="info-row">
                    <span className="label">Ishlovga qo'shgan:</span>
                    <span className="value">{selectedPerson.processedByName}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Qo'shilgan vaqt:</span>
                    <span className="value">
                      {new Date(selectedPerson.processedAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {user.role === "SUPER_ADMIN" && (
                <button
                  className="remove-button-large"
                  onClick={() => {
                    handleRemoveFromProcess(selectedPerson.id);
                  }}
                >
                  Ishlovdan chiqarish
                </button>
              )}
              <button className="close-button-large" onClick={closeModal}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
