import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Plus,
  Sparkles,
  LogOut,
  User,
  Users,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const { user, logout } = useAuth();

  const navigationItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Bibliotek", path: "/library", icon: BookOpen },
    ...(user?.role === "ADMIN"
      ? [
          { label: "Kategorier", path: "/categories", icon: Tags },
          { label: "Lägg till material", path: "/add-item", icon: Plus },
          { label: "Användare", path: "/users", icon: Users },
        ]
      : []),
    { label: "Min profil", path: "/profile", icon: User },
    { label: "Mina lån", path: "/my-loans", icon: BookOpen },
    { label: "Inställningar", path: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
  };

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

      <button
        type="button"
        className="sidebar-link"
        onClick={handleLogout}
        aria-label="Logga ut från BookWise"
      >
        <span className="sidebar-link-icon" aria-hidden="true">
          <LogOut size={19} strokeWidth={1.8} />
        </span>
        <span>Logga ut</span>
      </button>
    </aside>
  );
}

export default Sidebar;
