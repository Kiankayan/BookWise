import { useState } from "react";
import { motion } from "motion/react";
import { Bell, Moon, Sun, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [overdueNotifications, setOverdueNotifications] = useState(true);

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

  return (
    <motion.div
      className="settings-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">PERSONLIGT</p>
        <h2>Inställningar</h2>
        <p>Anpassa dina personliga inställningar i BookWise.</p>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Aviseringar</h3>
            <p>Hantera dina aviseringsinställningar.</p>
          </div>
          <Bell size={22} />
        </div>

        <label>
          <input
            type="checkbox"
            checked={reminderNotifications}
            onChange={(event) => setReminderNotifications(event.target.checked)}
          />
          Påminnelser om kommande förfallodatum
        </label>

        <label>
          <input
            type="checkbox"
            checked={overdueNotifications}
            onChange={(event) => setOverdueNotifications(event.target.checked)}
          />
          Aviseringar om försenade lån
        </label>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Utseende</h3>
            <p>Välj hur BookWise ska visas.</p>
          </div>
          {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
        </div>

        <label>
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={() => setTheme("light")}
          />
          Ljust tema
        </label>

        <label>
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => setTheme("dark")}
          />
          Mörkt tema
        </label>
      </section>

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Kontoinformation</h3>
            <p>Information om ditt BookWise-konto.</p>
          </div>
          <ShieldCheck size={22} />
        </div>

        <p>
          <strong>Kontotyp:</strong> {roleLabel}
        </p>
        <p>
          <strong>Användar-ID:</strong> {user?.id ?? "Inte tillgängligt"}
        </p>
      </section>
    </motion.div>
  );
}

export default SettingsPage;
