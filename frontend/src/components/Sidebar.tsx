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
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const navigationItems = [
    { label: t("sidebar.dashboard"), path: "/", icon: LayoutDashboard },
    { label: t("sidebar.library"), path: "/library", icon: BookOpen },
    ...(user?.role === "ADMIN"
      ? [
          { label: t("sidebar.categories"), path: "/categories", icon: Tags },
          { label: t("sidebar.addItem"), path: "/add-item", icon: Plus },
          { label: t("sidebar.users"), path: "/users", icon: Users },
        ]
      : []),
    { label: t("sidebar.profile"), path: "/profile", icon: User },
    { label: t("sidebar.myLoans"), path: "/my-loans", icon: BookOpen },
    { label: t("sidebar.settings"), path: "/settings", icon: Settings },
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
          <p>{t("sidebar.brandDescription")}</p>
        </div>
      </div>

      <div className="sidebar-section-label">{t("sidebar.menu")}</div>

      <nav className="sidebar-navigation" aria-label={t("sidebar.mainMenu")}>
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
          <p className="sidebar-footer-title">{t("sidebar.libraryTitle")}</p>
          <p className="sidebar-footer-text">
            {t("sidebar.libraryDescription")}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="sidebar-link"
        onClick={handleLogout}
        aria-label={t("sidebar.logoutAriaLabel")}
      >
        <span className="sidebar-link-icon" aria-hidden="true">
          <LogOut size={19} strokeWidth={1.8} />
        </span>
        <span>{t("sidebar.logout")}</span>
      </button>
    </aside>
  );
}

export default Sidebar;
