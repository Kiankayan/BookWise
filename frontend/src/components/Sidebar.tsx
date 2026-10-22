import { NavLink } from "react-router-dom";
import { LayoutDashboard, BookOpen, Tags, Plus, Sparkles } from "lucide-react";

const navigationItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Bibliotek", path: "/library", icon: BookOpen },
  { label: "Kategorier", path: "/categories", icon: Tags },
  { label: "Lägg till material", path: "/add-item", icon: Plus },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">B</div>
        <div className="sidebar-brand-text">
          <h2>Bookwise</h2>
          <p>Library management</p>
        </div>
      </div>

      <div className="sidebar-section-label">MENY</div>

      <nav className="sidebar-navigation" aria-label="Huvudmeny">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
            >
              <span className="sidebar-link-icon" aria-hidden="true">
                <Icon size={19} strokeWidth={1.8} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-icon">
          <Sparkles size={18} strokeWidth={1.8} />
        </div>
        <div>
          <p className="sidebar-footer-title">Ditt bibliotek</p>
          <p className="sidebar-footer-text">Ordning bland samlingarna</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
