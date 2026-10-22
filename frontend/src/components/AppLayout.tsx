import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout() {
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
            <div className="topbar-avatar">B</div>
            <div>
              <p className="topbar-profile-name">Bibliotekarie</p>
              <p className="topbar-profile-role">Administratör</p>
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
