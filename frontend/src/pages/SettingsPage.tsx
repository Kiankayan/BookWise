import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Bell, Moon, Sun, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [overdueNotifications, setOverdueNotifications] = useState(true);

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

  const panelAnimation = (delay: number) => ({
    initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.35,
      delay: shouldReduceMotion ? 0 : delay,
      ease: "easeOut" as const,
    },
  });

  return (
    <motion.div
      className="settings-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">PERSONLIGT</p>
        <h2>Inställningar</h2>
        <p>Anpassa dina personliga inställningar i BookWise.</p>
      </section>

      <motion.section className="settings-panel" {...panelAnimation(0.1)}>
        <div className="settings-panel-heading">
          <div>
            <h3>Aviseringar</h3>
            <p>Hantera dina aviseringsinställningar.</p>
          </div>
          <Bell size={22} />
        </div>

        <div className="settings-options">
          <label className="settings-option">
            <input
              type="checkbox"
              checked={reminderNotifications}
              onChange={(event) =>
                setReminderNotifications(event.target.checked)
              }
            />
            <span>Påminnelser om kommande förfallodatum</span>
          </label>

          <label className="settings-option">
            <input
              type="checkbox"
              checked={overdueNotifications}
              onChange={(event) =>
                setOverdueNotifications(event.target.checked)
              }
            />
            <span>Aviseringar om försenade lån</span>
          </label>
        </div>
      </motion.section>

      <motion.section className="settings-panel" {...panelAnimation(0.2)}>
        <div className="settings-panel-heading">
          <div>
            <h3>Utseende</h3>
            <p>Välj hur BookWise ska visas.</p>
          </div>
          {theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
        </div>

        <div className="settings-options">
          <label className="settings-option">
            <input
              type="radio"
              name="theme"
              value="light"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />
            <span>Ljust tema</span>
          </label>

          <label className="settings-option">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            <span>Mörkt tema</span>
          </label>
        </div>
      </motion.section>

      <motion.section className="settings-panel" {...panelAnimation(0.3)}>
        <div className="settings-panel-heading">
          <div>
            <h3>Kontoinformation</h3>
            <p>Information om ditt BookWise-konto.</p>
          </div>
          <ShieldCheck size={22} />
        </div>

        <div className="settings-account-details">
          <p>
            <strong>Kontotyp:</strong> {roleLabel}
          </p>
          <p>
            <strong>Användar-ID:</strong> {user?.id ?? "Inte tillgängligt"}
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default SettingsPage;
