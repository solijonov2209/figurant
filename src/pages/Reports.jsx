import { useState, useEffect } from "react";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import districtService from "../shared/services/districtService";
import reportService from "../shared/services/reportService";
import "./Reports.css";

export default function Reports() {
  const { user } = useAuth();

  const [reportType, setReportType] = useState("district");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [format, setFormat] = useState("csv");
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await districtService.getAll();
      setDistricts(response.data);

      // JQB admin bo'lsa, avtomatik uning tumanini tanlash
      if (user.role === "JQB_ADMIN" && user.districtId) {
        setSelectedDistrict(user.districtId.toString());
      }
    } catch (err) {
      setError("Tumanlarni yuklashda xatolik: " + err.message);
    }
  };

  const handleGenerateReport = async () => {
    setError("");
    setLoading(true);

    try {
      let persons;

      if (reportType === "district") {
        if (!selectedDistrict) {
          throw new Error("Tumanni tanlang");
        }

        // Tuman bo'yicha ma'lumotlar
        const response = await personService.getAll(user);
        persons = response.data.filter(p => p.districtId === parseInt(selectedDistrict));

        if (persons.length === 0) {
          throw new Error("Bu tumanda ma'lumot yo'q");
        }

        await reportService.generateDistrictReport(parseInt(selectedDistrict), persons, format);

      } else if (reportType === "in-process") {
        // Ishlovdagi shaxslar
        const response = await personService.getInProcess(user);
        persons = response.data;

        if (persons.length === 0) {
          throw new Error("Ishlovdagi shaxslar yo'q");
        }

        await reportService.generateInProcessReport(persons, format);

      } else if (reportType === "overall") {
        // Umumiy hisobot
        const response = await personService.getAll(user);
        persons = response.data;

        if (persons.length === 0) {
          throw new Error("Ma'lumot yo'q");
        }

        await reportService.generateOverallReport(persons, format);
      }

      alert("Hisobot muvaffaqiyatli yuklandi!");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <h2 className="page-title">Hisobot yuklash</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="reports-form">
        <div className="form-section">
          <h3>Hisobot turi</h3>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="reportType"
                value="district"
                checked={reportType === "district"}
                onChange={(e) => setReportType(e.target.value)}
              />
              <div className="radio-content">
                <span className="radio-title">Tuman bo'yicha hisobot</span>
                <span className="radio-description">
                  Tanlangan tuman bo'yicha barcha shaxslar hisoboti
                </span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="reportType"
                value="in-process"
                checked={reportType === "in-process"}
                onChange={(e) => setReportType(e.target.value)}
                disabled={user.role === "MAHALLA_INSPECTOR"}
              />
              <div className="radio-content">
                <span className="radio-title">Ishlovdagi shaxslar hisoboti</span>
                <span className="radio-description">
                  Hozirda ishlovda bo'lgan barcha shaxslar ro'yxati
                </span>
              </div>
            </label>

            <label className="radio-option">
              <input
                type="radio"
                name="reportType"
                value="overall"
                checked={reportType === "overall"}
                onChange={(e) => setReportType(e.target.value)}
              />
              <div className="radio-content">
                <span className="radio-title">Umumiy hisobot</span>
                <span className="radio-description">
                  {user.role === "SUPER_ADMIN"
                    ? "Barcha tumanlar bo'yicha to'liq hisobot"
                    : user.role === "JQB_ADMIN"
                    ? "Sizning tumaningiz bo'yicha to'liq hisobot"
                    : "Siz qo'shgan barcha shaxslar hisoboti"}
                </span>
              </div>
            </label>
          </div>
        </div>

        {reportType === "district" && (
          <div className="form-section">
            <h3>Tuman tanlang</h3>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={user.role === "JQB_ADMIN"}
              className="district-select"
            >
              <option value="">Tumanni tanlang</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-section">
          <h3>Fayl formati</h3>
          <div className="format-buttons">
            <button
              className={`format-button ${format === "csv" ? "active" : ""}`}
              onClick={() => setFormat("csv")}
            >
              <span className="format-icon">📊</span>
              <span className="format-name">CSV</span>
              <span className="format-description">Excel uchun</span>
            </button>

            <button
              className={`format-button ${format === "excel" ? "active" : ""}`}
              onClick={() => setFormat("excel")}
            >
              <span className="format-icon">📗</span>
              <span className="format-name">Excel</span>
              <span className="format-description">.xlsx format</span>
            </button>

            <button
              className={`format-button ${format === "pdf" ? "active" : ""}`}
              onClick={() => setFormat("pdf")}
            >
              <span className="format-icon">📄</span>
              <span className="format-name">PDF</span>
              <span className="format-description">Chop etish uchun</span>
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            className="generate-button"
            onClick={handleGenerateReport}
            disabled={loading || (reportType === "district" && !selectedDistrict)}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Tayyorlanmoqda...
              </>
            ) : (
              <>
                <span>📥</span>
                Hisobotni yuklash
              </>
            )}
          </button>
        </div>

        <div className="info-box">
          <h4>📌 Eslatma:</h4>
          <ul>
            <li>Hisobot tanlangan parametrlarga asosan tayyorlanadi</li>
            <li>CSV va Excel formatlar jadval ko'rinishida bo'ladi</li>
            <li>PDF format chop etish uchun qulay</li>
            <li>Barcha ma'lumotlar xavfsiz saqlangan</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
