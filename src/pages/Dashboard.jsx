import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard__map">MAP</div>

      <div className="dashboard__stats">
        <div className="card">Shaxslar:</div>
        <div className="card">Ishlovdagi shaxslar:</div>
      </div>

      <button className="dashboard__btn">
        Hisobot Yuklash
      </button>

      <div className="dashboard__list">
        Kiritilgan ma’lumotlar ro‘yxati
      </div>
    </div>
  );
}
