import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import districtService from "../shared/services/districtService";
import crimeCategoryService from "../shared/services/crimeCategoryService";
import crimeTypeService from "../shared/services/crimeTypeService";
import { Upload, Lock, Scale, X, Camera } from "lucide-react";
import "./AddPerson.css";

export default function AddPerson() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    birthDate: "",
    passportSerial: "",
    passportNumber: "",
    address: "",
    carInfo: "",
    districtId: "",
    mahallaId: "",
    crimeTypeId: "",
    holat: "",
    additionalInfo: ""
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [fingerprintFile, setFingerprintFile] = useState(null);

  const [districts, setDistricts] = useState([]);
  const [mahallas, setMahallas] = useState([]);
  const [crimeCategories, setCrimeCategories] = useState([]);
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [filteredCrimeTypes, setFilteredCrimeTypes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [isSudlangan, setIsSudlangan] = useState(false);
  const [sudModalOpen, setSudModalOpen] = useState(false);
  const [sudData, setSudData] = useState({
    sudNomi: "",
    sudSana: "",
    hukmTuri: "",
    jazoMuddeti: ""
  });

  useEffect(() => {
    loadDistricts();
    loadCrimeCategories();
    loadCrimeTypes();
  }, []);

  const loadDistricts = async () => {
    try {
      const response = await districtService.getAll();
      setDistricts(response.data);

      // Agar JQB admin bo'lsa, avtomatik uning tumanini tanlash
      if (user.role === "JQB_ADMIN" && user.districtId) {
        setFormData(prev => ({ ...prev, districtId: user.districtId }));
        loadMahallas(user.districtId);
      }

      // Agar mahalla inspektori bo'lsa, avtomatik uning tumani va mahallasini tanlash
      if (user.role === "MAHALLA_INSPECTOR" && user.mahallaId) {
        setFormData(prev => ({
          ...prev,
          districtId: user.districtId,
          mahallaId: user.mahallaId
        }));
        loadMahallas(user.districtId);
      }
    } catch (err) {
      setError("Tumanlarni yuklashda xatolik: " + err.message);
    }
  };

  const loadCrimeCategories = async () => {
    try {
      const response = await crimeCategoryService.getAll();
      setCrimeCategories(response.data);
    } catch (err) {
      setError("Turkumlarni yuklashda xatolik: " + err.message);
    }
  };

  const loadCrimeTypes = async () => {
    try {
      const response = await crimeTypeService.getAll();
      setCrimeTypes(response.data);
    } catch (err) {
      setError("Jinoyat turlarini yuklashda xatolik: " + err.message);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    setSelectedCategoryId(e.target.value);
    setFormData({ ...formData, crimeTypeId: "" });
    setFilteredCrimeTypes(crimeTypes.filter(ct => ct.categoryId === categoryId));
  };

  const handleSudlaganChange = (e) => {
    setIsSudlangan(e.target.checked);
    if (e.target.checked) {
      setSudModalOpen(true);
    } else {
      setSudData({ sudNomi: "", sudSana: "", hukmTuri: "", jazoMuddeti: "" });
    }
  };

  const closeSudModal = () => {
    setSudModalOpen(false);
  };

  const loadMahallas = async (districtId) => {
    try {
      const response = await districtService.getMahallas(districtId);
      setMahallas(response.data);
    } catch (err) {
      setError("Mahallalarni yuklashda xatolik: " + err.message);
    }
  };

  // Handle district change
  const handleDistrictChange = (e) => {
    const districtId = parseInt(e.target.value);
    setFormData({ ...formData, districtId, mahallaId: "" });
    loadMahallas(districtId);
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle fingerprint upload
  const handleFingerprintChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFingerprintFile(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validatsiya
      if (!formData.firstName || !formData.lastName || !formData.middleName) {
        throw new Error("Ism, Familiya va Otasining ismi majburiy");
      }

      if (!formData.birthDate) {
        throw new Error("Tug'ilgan sana majburiy");
      }

      if (!formData.passportSerial || !formData.passportNumber) {
        throw new Error("Pasport seria va raqam majburiy");
      }

      if (!formData.districtId || !formData.mahallaId) {
        throw new Error("Tuman va Mahalla majburiy");
      }

      if (!formData.crimeTypeId) {
        throw new Error("Jinoyat turini tanlang");
      }

      if (!formData.holat) {
        throw new Error("Holatni tanlang");
      }

      // Tuman, Mahalla, Turkum va Jinoyat turi nomlarini olish
      const district = districts.find(d => d.id === parseInt(formData.districtId));
      const mahalla = mahallas.find(m => m.id === parseInt(formData.mahallaId));
      const crimeType = crimeTypes.find(ct => ct.id === parseInt(formData.crimeTypeId));
      const crimeCategory = crimeCategories.find(c => c.id === parseInt(selectedCategoryId));

      // Ma'lumotni saqlash
      const personData = {
        ...formData,
        districtId: parseInt(formData.districtId),
        districtName: district.name,
        mahallaId: parseInt(formData.mahallaId),
        mahallaName: mahalla.name,
        crimeCategoryId: parseInt(selectedCategoryId),
        crimeCategoryName: crimeCategory.name,
        crimeTypeId: parseInt(formData.crimeTypeId),
        crimeTypeName: crimeType.name,
        photoUrl: photoPreview,
        fingerprintUrl: fingerprintFile ? fingerprintFile.name : null,
        sudlangan: isSudlangan,
        ...(isSudlangan ? sudData : {})
      };

      await personService.create(personData, user);

      setSuccess(true);

      // 2 sekunddan keyin dashboard ga o'tish
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      birthDate: "",
      passportSerial: "",
      passportNumber: "",
      address: "",
      carInfo: "",
      districtId: user.role === "JQB_ADMIN" ? user.districtId : "",
      mahallaId: user.role === "MAHALLA_INSPECTOR" ? user.mahallaId : "",
      crimeTypeId: "",
      holat: "",
      additionalInfo: ""
    });
    setSelectedCategoryId("");
    setFilteredCrimeTypes([]);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFingerprintFile(null);
    setIsSudlangan(false);
    setSudModalOpen(false);
    setSudData({ sudNomi: "", sudSana: "", hukmTuri: "", jazoMuddeti: "" });
    setError("");
    setSuccess(false);
  };

  return (
    <div className="add-person-container">
      <h2 className="page-title">Ma'lumot qo'shish</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Muvaffaqiyatli qo'shildi!</div>}

      <form onSubmit={handleSubmit} className="add-person-form">
        <div className="person-form-grid">
          {/* Chap tomonda - Rasm yuklash */}
          <div className="photo-section">
            <div className="photo-upload-box">
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Preview" className="photo-preview" />
                  <button
                    type="button"
                    className="remove-photo-button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="photo-placeholder">
                  <Camera size={48} />
                  <p>Rasm yuklash</p>
                </div>
              )}
            </div>

            {/* Kameradan rasm olish (mobil qurilmalar uchun) */}
            <input
              type="file"
              id="photo-camera"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />

            {/* Galereya/fayldan rasm yuklash */}
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />

            <div className="photo-buttons">
              <label htmlFor="photo-camera" className="upload-button upload-button--camera">
                <Camera size={16} /> Kameradan olish
              </label>
              <label htmlFor="photo-upload" className="upload-button upload-button--gallery">
                <Upload size={16} /> Galereya
              </label>
            </div>
          </div>

          {/* O'ng tomonda - Forma maydonlari */}
          <div className="form-fields">
            <div className="form-row">
              <input
                type="text"
                placeholder="Familiya:"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Ism:"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Otasining ismi:"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="date"
                placeholder="Tug'ilgan sana:"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>

            <div className="form-row passport-row">
              <input
                type="text"
                placeholder="Pasport seria:"
                value={formData.passportSerial}
                onChange={(e) => setFormData({ ...formData, passportSerial: e.target.value.toUpperCase() })}
                maxLength="2"
                required
                className="passport-seria"
              />
              <input
                type="text"
                placeholder="Pasport raqam"
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                maxLength="7"
                required
                className="passport-number"
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Manzil (yashash manzili va uy raqami):"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Avtomobil ma'lumoti:"
                value={formData.carInfo}
                onChange={(e) => setFormData({ ...formData, carInfo: e.target.value })}
              />
            </div>

            <div className="form-row dropdown-row">
              <select
                value={formData.districtId}
                onChange={handleDistrictChange}
                required
                disabled={user.role === "JQB_ADMIN" || user.role === "MAHALLA_INSPECTOR"}
              >
                <option value="">Tuman:</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.mahallaId}
                onChange={(e) => setFormData({ ...formData, mahallaId: e.target.value })}
                required
                disabled={!formData.districtId || user.role === "MAHALLA_INSPECTOR"}
              >
                <option value="">MFY(manzil):</option>
                {mahallas.map(mahalla => (
                  <option key={mahalla.id} value={mahalla.id}>
                    {mahalla.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row dropdown-row">
              <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Turkum:</option>
                {crimeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.crimeTypeId}
                onChange={(e) => setFormData({ ...formData, crimeTypeId: e.target.value })}
                required
                disabled={!selectedCategoryId}
              >
                <option value="">Jinoyat turi:</option>
                {filteredCrimeTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <select
                value={formData.holat}
                onChange={(e) => setFormData({ ...formData, holat: e.target.value })}
                required
              >
                <option value="">Holat:</option>
                <option value="ISHLOV">Ishlov</option>
                <option value="TEZKOR_QIZIQUV">Tezkor qiziquv</option>
              </select>
            </div>

            <div className="form-row sudlangan-row">
              <label className="sudlangan-label">
                <input type="checkbox" checked={isSudlangan} onChange={handleSudlaganChange} />
                <span>Sudlangan mi?</span>
              </label>
              {isSudlangan && (
                <button
                  type="button"
                  className={`sud-info-badge ${sudData.sudNomi ? "" : "sud-info-badge--empty"}`}
                  onClick={() => setSudModalOpen(true)}
                >
                  <Scale size={14} /> {sudData.sudNomi ? "Sud ma'lumotlari kiritilgan" : "Sud ma'lumotlarini kiriting"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Qo'shimcha ma'lumotlar */}
        <div className="additional-info-section">
          <label>Qo'shimcha ma'lumotlari:</label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            rows="5"
            placeholder="Qo'shimcha ma'lumotlar..."
          />
        </div>

        {/* Barmoq izi */}
        <div className="fingerprint-section">
          <input
            type="file"
            id="fingerprint-upload"
            accept="image/*,.pdf"
            onChange={handleFingerprintChange}
            style={{ display: "none" }}
          />
          <label htmlFor="fingerprint-upload" className="fingerprint-button">
            <Lock size={16} /> Barmoq izi
          </label>
          {fingerprintFile && <span className="file-name">{fingerprintFile.name}</span>}
        </div>

        {/* Submit va Reset tugmalari */}
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="reset-button" disabled={loading}>
            Tozalash
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Saqlanmoqda..." : "TASDIQLASH"}
          </button>
        </div>
      </form>

      {/* Sud ma'lumotlari modal */}
      {sudModalOpen && (
        <div className="sud-modal-overlay" onClick={closeSudModal}>
          <div className="sud-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sud-modal-header">
              <h3><Scale size={18} /> Sud ma'lumotlari</h3>
              <button className="sud-modal-close" onClick={closeSudModal}><X size={18} /></button>
            </div>
            <div className="sud-modal-body">
              <input
                type="text"
                placeholder="Sud nomi:"
                value={sudData.sudNomi}
                onChange={(e) => setSudData({ ...sudData, sudNomi: e.target.value })}
              />
              <input
                type="date"
                value={sudData.sudSana}
                onChange={(e) => setSudData({ ...sudData, sudSana: e.target.value })}
              />
              <input
                type="text"
                placeholder="Hukm turi:"
                value={sudData.hukmTuri}
                onChange={(e) => setSudData({ ...sudData, hukmTuri: e.target.value })}
              />
              <input
                type="text"
                placeholder="Jazo muddeti:"
                value={sudData.jazoMuddeti}
                onChange={(e) => setSudData({ ...sudData, jazoMuddeti: e.target.value })}
              />
            </div>
            <div className="sud-modal-footer">
              <button type="button" onClick={closeSudModal} className="sud-modal-confirm">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
