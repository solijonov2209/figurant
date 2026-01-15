import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="/logo.png" alt="logo" />
      </div>

      <ul className="sidebar__menu">
        <li>Bosh sahifa</li>
        <li>Ma’lumot qo‘shish</li>
        <li>Ishlovdagi shaxslar</li>
        <li>Qidirish</li>
        <li>Hisobot yuklash</li>
      </ul>

      <div className="sidebar__bottom">
        inspektor qo‘shish
      </div>
    </aside>
  );
}
