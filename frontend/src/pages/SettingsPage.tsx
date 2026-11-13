import { motion, useReducedMotion } from "motion/react";
import { Bell, Moon, Sun, ShieldCheck, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SettingsAvatar from "../components/settings/SettingsAvatar";
import { useState } from "react";

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [overdueNotifications, setOverdueNotifications] = useState(true);

  const roleLabel =
    user?.role === "ADMIN" ? t("settings.administrator") : t("settings.user");

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
        <p className="eyebrow">{t("settings.personal")}</p>
        <h2>{t("settings.title")}</h2>
        <p>{t("settings.description")}</p>
      </section>

      <SettingsAvatar />

      <motion.section className="settings-panel" {...panelAnimation(0.1)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.notifications")}</h3>
            <p>{t("settings.notificationsDescription")}</p>
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
            <span>{t("settings.reminderNotifications")}</span>
          </label>

          <label className="settings-option">
            <input
              type="checkbox"
              checked={overdueNotifications}
              onChange={(event) =>
                setOverdueNotifications(event.target.checked)
              }
            />
            <span>{t("settings.overdueNotifications")}</span>
          </label>
        </div>
      </motion.section>

      <motion.section className="settings-panel" {...panelAnimation(0.2)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.appearance")}</h3>
            <p>{t("settings.appearanceDescription")}</p>
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
            <span>{t("settings.light")}</span>
          </label>

          <label className="settings-option">
            <input
              type="radio"
              name="theme"
              value="dark"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />
            <span>{t("settings.dark")}</span>
          </label>
        </div>
      </motion.section>

      <motion.section className="settings-panel" {...panelAnimation(0.3)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.language")}</h3>
            <p>{t("settings.languageDescription")}</p>
          </div>
          <Languages size={22} />
        </div>

        <div className="settings-options">
          <label className="settings-option">
            <input
              type="radio"
              name="language"
              value="sv"
              checked={i18n.language.startsWith("sv")}
              onChange={() => i18n.changeLanguage("sv")}
            />
            <span>{t("settings.swedish")}</span>
          </label>

          <label className="settings-option">
            <input
              type="radio"
              name="language"
              value="en"
              checked={i18n.language.startsWith("en")}
              onChange={() => i18n.changeLanguage("en")}
            />
            <span>{t("settings.english")}</span>
          </label>
        </div>
      </motion.section>

      <motion.section className="settings-panel" {...panelAnimation(0.4)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.accountInformation")}</h3>
            <p>{t("settings.accountInformationDescription")}</p>
          </div>
          <ShieldCheck size={22} />
        </div>

        <div className="settings-account-details">
          <p>
            <strong>{t("settings.accountType")}:</strong> {roleLabel}
          </p>
          <p>
            <strong>{t("settings.userId")}:</strong>{" "}
            {user?.id ?? t("settings.notAvailable")}
          </p>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default SettingsPage;
