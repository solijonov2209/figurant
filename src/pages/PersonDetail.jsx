import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import "./PersonDetail.css";

export default function PersonDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPerson();
  }, [id]);

  const loadPerson = async () => {
    try {
      setLoading(true);
      const response = await personService.getAll(user);
      const foundPerson = response.data.find(p => p.id === parseInt(id));

      if (!foundPerson) {
        setError("Shaxs topilmadi");
        return;
      }

      setPerson(foundPerson);
    } catch (err) {
      setError("Ma'lumotlarni yuklashda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!person) return;

    // Ma'lumotlarni PDF formatda yuklab olish
    const content = `
═══════════════════════════════════════
          SHAXS MA'LUMOTLARI
═══════════════════════════════════════

SHAXSIY MA'LUMOTLAR:
-----------------------------------
Familiya:           ${person.lastName}
Ism:                ${person.firstName}
Otasining ismi:     ${person.middleName}
Tug'ilgan sana:     ${person.birthDate}

HUJJAT MA'LUMOTLARI:
-----------------------------------
Pasport:            ${person.passportSerial} ${person.passportNumber}
Avtomobil:          ${person.carInfo || "Ma'lumot yo'q"}

MANZIL MA'LUMOTLARI:
-----------------------------------
Tuman:              ${person.districtName}
Mahalla:            ${person.mahallaName}

JINOYAT MA'LUMOTLARI:
-----------------------------------
Jinoyat turi:       ${person.crimeTypeName || "Ma'lumot yo'q"}
Qo'shimcha:         ${person.additionalInfo || "Ma'lumot yo'q"}

RO'YXATGA OLISH:
-----------------------------------
Ro'yxatga olgan:    ${person.registeredByName}
Telefon:            ${person.registeredByPhone}
Sana:               ${new Date(person.registeredAt).toLocaleString('uz-UZ')}

HOLAT:
-----------------------------------
Ishlovda:           ${person.inProcess ? "Ha" : "Yo'q"}
${person.inProcess ? `Ishlovga olgan:     ${person.processedByName}\nIshlovga olingan:   ${new Date(person.processedAt).toLocaleString('uz-UZ')}` : ''}

═══════════════════════════════════════
Chop etilgan sana: ${new Date().toLocaleString('uz-UZ')}
═══════════════════════════════════════
    `;

    // Text faylni yuklab olish
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${person.lastName}_${person.firstName}_malumot.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="person-detail-container">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="person-detail-container">
        <div className="error-message">{error || "Shaxs topilmadi"}</div>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Orqaga
        </button>
      </div>
    );
  }

  return (
    <div className="person-detail-container">
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Orqaga
        </button>
        <h2 className="page-title">Shaxs Ma'lumotlari</h2>
        <div className="header-actions">
          <button className="download-button" onClick={handleDownload}>
            📥 Yuklab olish
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Photo Section */}
        <div className="photo-section">
          {person.photoUrl ? (
            <img src={person.photoUrl} alt="Shaxs rasmi" className="person-photo" />
          ) : (
            <div className="photo-placeholder">
              <span className="photo-icon">👤</span>
              <p>Rasm yuklanmagan</p>
            </div>
          )}

          {person.inProcess && (
            <div className="status-badge in-process">
              ⚠️ Ishlovda
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="info-section">
          <div className="info-card">
            <h3 className="card-title">Shaxsiy Ma'lumotlar</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Familiya:</label>
                <p>{person.lastName}</p>
              </div>
              <div className="info-item">
                <label>Ism:</label>
                <p>{person.firstName}</p>
              </div>
              <div className="info-item">
                <label>Otasining ismi:</label>
                <p>{person.middleName}</p>
              </div>
              <div className="info-item">
                <label>Tug'ilgan sana:</label>
                <p>{person.birthDate}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Hujjat Ma'lumotlari</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Pasport seriya va raqam:</label>
                <p className="passport">{person.passportSerial} {person.passportNumber}</p>
              </div>
              <div className="info-item">
                <label>Avtomobil ma'lumoti:</label>
                <p>{person.carInfo || "Ma'lumot yo'q"}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Manzil Ma'lumotlari</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tuman:</label>
                <p>{person.districtName}</p>
              </div>
              <div className="info-item">
                <label>Mahalla:</label>
                <p>{person.mahallaName}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Jinoyat Ma'lumotlari</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Jinoyat turi:</label>
                <p className="crime-type">{person.crimeTypeName || "Ma'lumot yo'q"}</p>
              </div>
              <div className="info-item full-width">
                <label>Qo'shimcha ma'lumotlar:</label>
                <p className="additional-info">{person.additionalInfo || "Ma'lumot yo'q"}</p>
              </div>
            </div>
          </div>

          <div className="info-card">
            <h3 className="card-title">Ro'yxatga Olish Ma'lumotlari</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Ro'yxatga olgan:</label>
                <p>{person.registeredByName}</p>
              </div>
              <div className="info-item">
                <label>Telefon raqam:</label>
                <p>{person.registeredByPhone}</p>
              </div>
              <div className="info-item">
                <label>Ro'yxatga olingan sana:</label>
                <p>{new Date(person.registeredAt).toLocaleString('uz-UZ')}</p>
              </div>
            </div>
          </div>

          {person.inProcess && person.processedByName && (
            <div className="info-card process-info">
              <h3 className="card-title">Ishlov Ma'lumotlari</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Ishlovga olgan:</label>
                  <p>{person.processedByName}</p>
                </div>
                <div className="info-item">
                  <label>Ishlovga olingan sana:</label>
                  <p>{new Date(person.processedAt).toLocaleString('uz-UZ')}</p>
                </div>
              </div>
            </div>
          )}

          {person.fingerprintUrl && (
            <div className="info-card">
              <h3 className="card-title">Barmoq Izi</h3>
              <div className="info-item">
                <p>🔒 Barmoq izi fayl: {person.fingerprintUrl}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
