import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

function AppLayout() {
  const { user } = useAuth();

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-heading">
            <p className="topbar-eyebrow">BOOKWISE / BIBLIOTEK</p>
            <h1>Bibliotekshantering</h1>
          </div>

          <div className="topbar-profile">
            <div className="topbar-avatar">
              {user?.name.charAt(0).toUpperCase()}
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
      </div>
    </div>
  );
}

export default AppLayout;
