import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import districtService from "../shared/services/districtService";
import "./Search.css";

export default function Search() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    passportSerial: "",
    passportNumber: "",
    districtId: "",
    mahallaId: ""
  });

  const [persons, setPersons] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mahallas, setMahallas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDistricts();
  }, []);

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
    const districtId = e.target.value;
    setFilters({ ...filters, districtId, mahallaId: "" });
    if (districtId) {
      loadMahallas(districtId);
    } else {
      setMahallas([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await personService.search(filters, user);
      setPersons(response.data);
      setSearched(true);
    } catch (err) {
      setError("Qidirishda xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      firstName: "",
      lastName: "",
      passportSerial: "",
      passportNumber: "",
      districtId: "",
      mahallaId: ""
    });
    setPersons([]);
    setSearched(false);
    setMahallas([]);
    setError("");
  };

  const handleAddToProcess = async (personId, e) => {
    e.stopPropagation(); // Prevent row click navigation

    if (!confirm("Haqiqatan ham ishlovga qo'shmoqchimisiz?")) {
      return;
    }

    try {
      await personService.addToProcess(personId, user);
      alert("Ishlovga qo'shildi");
      handleSearch(new Event('submit'));
    } catch (err) {
      alert("Xatolik: " + err.message);
    }
  };

  return (
    <div className="search-container">
      <h2 className="page-title">Qidirish</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-filters">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Ism"
              value={filters.firstName}
              onChange={(e) => setFilters({ ...filters, firstName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Familiya"
              value={filters.lastName}
              onChange={(e) => setFilters({ ...filters, lastName: e.target.value })}
            />
          </div>

          <div className="filter-row">
            <input
              type="text"
              placeholder="Pasport seria (AA)"
              value={filters.passportSerial}
              onChange={(e) => setFilters({ ...filters, passportSerial: e.target.value.toUpperCase() })}
              maxLength="2"
              className="passport-seria-input"
            />
            <input
              type="text"
              placeholder="Pasport raqam (1234567)"
              value={filters.passportNumber}
              onChange={(e) => setFilters({ ...filters, passportNumber: e.target.value })}
              maxLength="7"
            />
          </div>

          <div className="filter-row">
            <select value={filters.districtId} onChange={handleDistrictChange}>
              <option value="">Barcha tumanlar</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>

            <select
              value={filters.mahallaId}
              onChange={(e) => setFilters({ ...filters, mahallaId: e.target.value })}
              disabled={!filters.districtId}
            >
              <option value="">Barcha mahallalar</option>
              {mahallas.map(mahalla => (
                <option key={mahalla.id} value={mahalla.id}>
                  {mahalla.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="search-actions">
          <button type="button" onClick={handleReset} className="reset-button">
            Tozalash
          </button>
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? "Qidirilmoqda..." : "🔍 Qidirish"}
          </button>
        </div>
      </form>

      {/* Natijalar */}
      {searched && (
        <div className="search-results">
          <div className="results-header">
            <h3>Topilgan natijalar: {persons.length}</h3>
          </div>

          {persons.length === 0 ? (
            <div className="empty-state">
              <p>Hech narsa topilmadi</p>
            </div>
          ) : (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>F.I.O</th>
                    <th>Tug'ilgan sana</th>
                    <th>Pasport</th>
                    <th>Tuman</th>
                    <th>Mahalla</th>
                    <th>Ishlovda</th>
                    <th>Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map((person, index) => (
                    <tr
                      key={person.id}
                      onClick={() => navigate(`/person/${person.id}`)}
                      className="clickable-row"
                    >
                      <td>{index + 1}</td>
                      <td>{person.lastName} {person.firstName} {person.middleName}</td>
                      <td>{person.birthDate}</td>
                      <td>{person.passportSerial} {person.passportNumber}</td>
                      <td>{person.districtName}</td>
                      <td>{person.mahallaName}</td>
                      <td>
                        {person.inProcess ? (
                          <span className="badge badge-success">Ha</span>
                        ) : (
                          <span className="badge badge-secondary">Yo'q</span>
                        )}
                      </td>
                      <td>
                        {(user.role === "SUPER_ADMIN" || user.role === "JQB_ADMIN") && !person.inProcess && (
                          <button
                            className="btn-add-process"
                            onClick={(e) => handleAddToProcess(person.id, e)}
                          >
                            Ishlovga qo'shish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
