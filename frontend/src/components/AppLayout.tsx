import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

function AppLayout() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const roleLabel =
    user?.role === "ADMIN" ? t("appLayout.administrator") : t("appLayout.user");

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-heading">
            <p className="topbar-eyebrow">{t("appLayout.breadcrumb")}</p>
            <h1>{t("appLayout.title")}</h1>
          </div>

          <div className="topbar-profile">
            <div className="topbar-avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={t("appLayout.profilePicture")} />
              ) : user?.gender === "MAN" ? (
                <img
                  src="/images/avatar-man.png"
                  alt={t("appLayout.profilePicture")}
                />
              ) : user?.gender === "WOMAN" ? (
                <img
                  src="/images/avatar-woman.png"
                  alt={t("appLayout.profilePicture")}
                />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <p className="topbar-profile-name">{user?.name}</p>
              <p className="topbar-profile-role">{roleLabel}</p>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>

        <footer className="app-footer">
          <span>{t("appLayout.footerTagline")}</span>
          <span>
            {t("appLayout.footerCopyright", { year: new Date().getFullYear() })}
          </span>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;
