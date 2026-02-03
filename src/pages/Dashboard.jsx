import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import personService from "../shared/services/personService";
import districtService from "../shared/services/districtService";
import { Users, AlertTriangle, FileText } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allPersons, setAllPersons] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtStats, setDistrictStats] = useState({});
  const [overallStats, setOverallStats] = useState({ total: 0, inProcess: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Barcha shaxslarni yuklash
      const personsResponse = await personService.getAll(user);
      setAllPersons(personsResponse.data);

      // Umumiy statistika
      const statsResponse = await personService.getOverallStats();
      setOverallStats(statsResponse.data);

      // Har bir tuman uchun statistika
      const districts = await districtService.getAll();
      const stats = {};

      for (const district of districts.data) {
        const districtPersons = personsResponse.data.filter(p => p.districtId === district.id);
        stats[district.id] = {
          total: districtPersons.length,
          inProcess: districtPersons.filter(p => p.inProcess).length,
          name: district.name
        };
      }

      setDistrictStats(stats);

    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = (districtId) => {
    setSelectedDistrict(selectedDistrict === districtId ? null : districtId);
  };

  const filteredPersons = selectedDistrict
    ? allPersons.filter(p => p.districtId === selectedDistrict)
    : [];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Xarita - faqat Super Admin uchun */}
      {user.role === "SUPER_ADMIN" && (
        <div className="dashboard__map">
          <svg viewBox="0 0 1000 600" className="namangan-map">
            {/* Pop tumani */}
            <g onClick={() => handleDistrictClick(1)} className="district" data-selected={selectedDistrict === 1}>
              <path d="M 100 150 L 250 150 L 250 350 L 100 350 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="175" y="250" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">ПОП</text>
            </g>

            {/* Chust tumani */}
            <g onClick={() => handleDistrictClick(2)} className="district" data-selected={selectedDistrict === 2}>
              <path d="M 250 150 L 400 150 L 400 280 L 250 280 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="325" y="215" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">ЧУСТ</text>
            </g>

            {/* Yangiqo'rg'on */}
            <g onClick={() => handleDistrictClick(3)} className="district" data-selected={selectedDistrict === 3}>
              <path d="M 100 350 L 300 350 L 300 500 L 100 500 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="200" y="425" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black">ЯНГИҚЎРҒОН</text>
            </g>

            {/* Kosonsoy */}
            <g onClick={() => handleDistrictClick(4)} className="district" data-selected={selectedDistrict === 4}>
              <path d="M 400 180 L 550 180 L 550 320 L 400 320 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="475" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black">КОСОНСОЙ</text>
            </g>

            {/* Chortoq */}
            <g onClick={() => handleDistrictClick(5)} className="district" data-selected={selectedDistrict === 5}>
              <path d="M 550 200 L 650 200 L 650 300 L 550 300 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="600" y="250" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black">ЧОРТОҚ</text>
            </g>

            {/* Uychi */}
            <g onClick={() => handleDistrictClick(6)} className="district" data-selected={selectedDistrict === 6}>
              <path d="M 650 150 L 750 150 L 750 250 L 650 250 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="700" y="200" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">УЙЧИ</text>
            </g>

            {/* Namangan */}
            <g onClick={() => handleDistrictClick(7)} className="district" data-selected={selectedDistrict === 7}>
              <path d="M 400 320 L 600 320 L 600 450 L 400 450 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="500" y="385" textAnchor="middle" fontSize="12" fontWeight="bold" fill="black">НАМАНГАН</text>
            </g>

            {/* Norin */}
            <g onClick={() => handleDistrictClick(8)} className="district" data-selected={selectedDistrict === 8}>
              <path d="M 750 180 L 900 180 L 900 300 L 750 300 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="825" y="240" textAnchor="middle" fontSize="14" fontWeight="bold" fill="black">НОРИН</text>
            </g>

            {/* Mingbuloq */}
            <g onClick={() => handleDistrictClick(9)} className="district" data-selected={selectedDistrict === 9}>
              <path d="M 600 350 L 750 350 L 750 480 L 600 480 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="675" y="415" textAnchor="middle" fontSize="11" fontWeight="bold" fill="black">МИНГБУЛОҚ</text>
            </g>

            {/* To'raqo'rg'on */}
            <g onClick={() => handleDistrictClick(10)} className="district" data-selected={selectedDistrict === 10}>
              <path d="M 750 350 L 900 350 L 900 500 L 750 500 Z" fill="#50C878" stroke="white" strokeWidth="2" />
              <text x="825" y="425" textAnchor="middle" fontSize="11" fontWeight="bold" fill="black">ТЎРАҚЎРҒОН</text>
            </g>
          </svg>
        </div>
      )}

      {/* Statistika */}
      <div className="dashboard__stats">
        <div className="stat-card">
          <div className="stat-icon"><Users size={28} /></div>
          <div className="stat-info">
            <div className="stat-label">Shaxslar:</div>
            <div className="stat-value">{overallStats.total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={28} /></div>
          <div className="stat-info">
            <div className="stat-label">Ishlovdagi shaxslar:</div>
            <div className="stat-value">{overallStats.inProcess}</div>
          </div>
        </div>
      </div>

      {/* Hisobot yuklash tugmasi */}
      <button className="dashboard__btn" onClick={() => navigate('/reports')}>
        <FileText size={16} /> Hisobot Yuklash
      </button>

      {/* Tanlangan tuman statistikasi */}
      {selectedDistrict && districtStats[selectedDistrict] && (
        <div className="district-details">
          <h3>{districtStats[selectedDistrict].name}</h3>
          <div className="district-stats">
            <div className="district-stat">
              <span className="label">Jami shaxslar:</span>
              <span className="value">{districtStats[selectedDistrict].total}</span>
            </div>
            <div className="district-stat">
              <span className="label">Ishlovda:</span>
              <span className="value">{districtStats[selectedDistrict].inProcess}</span>
            </div>
          </div>

          {/* Tanlangan tuman shaxslari ro'yxati */}
          {filteredPersons.length > 0 && (
            <div className="persons-list">
              <h4>Shaxslar ro'yxati:</h4>
              <table className="persons-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>F.I.O</th>
                    <th>Pasport</th>
                    <th>Mahalla</th>
                    <th>Ishlovda</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersons.map((person, index) => (
                    <tr
                      key={person.id}
                      onClick={() => navigate(`/person/${person.id}`)}
                      className="clickable-row"
                    >
                      <td>{index + 1}</td>
                      <td>{person.lastName} {person.firstName}</td>
                      <td>{person.passportSerial} {person.passportNumber}</td>
                      <td>{person.mahallaName}</td>
                      <td>
                        {person.inProcess ? (
                          <span className="badge badge-yes">Ha</span>
                        ) : (
                          <span className="badge badge-no">Yo'q</span>
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

      {/* Oxirgi qo'shilgan shaxslar */}
      {!selectedDistrict && (
        <div className="dashboard__list">
          <h3>Oxirgi qo'shilgan shaxslar</h3>
          {allPersons.length === 0 ? (
            <p className="empty-text">Hozircha ma'lumot yo'q</p>
          ) : (
            <table className="persons-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>F.I.O</th>
                  <th>Tuman</th>
                  <th>Mahalla</th>
                  <th>Ro'yxatga olingan vaqt</th>
                  <th>Ishlovda</th>
                </tr>
              </thead>
              <tbody>
                {allPersons.slice(0, 10).map((person, index) => (
                  <tr
                    key={person.id}
                    onClick={() => navigate(`/person/${person.id}`)}
                    className="clickable-row"
                  >
                    <td>{index + 1}</td>
                    <td>{person.lastName} {person.firstName}</td>
                    <td>{person.districtName}</td>
                    <td>{person.mahallaName}</td>
                    <td>{new Date(person.registeredAt).toLocaleString('uz-UZ')}</td>
                    <td>
                      {person.inProcess ? (
                        <span className="badge badge-yes">Ha</span>
                      ) : (
                        <span className="badge badge-no">Yo'q</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

