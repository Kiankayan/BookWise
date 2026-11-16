import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Languages,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SettingsAvatar from "../components/settings/SettingsAvatar";
import { deleteMyAccount } from "../services/UserService";

function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const shouldReduceMotion = useReducedMotion();

  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [overdueNotifications, setOverdueNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      setDeleteError(t("settings.deletePasswordRequired"));
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteMyAccount(password);

      setShowDeleteDialog(false);
      setDeleteSuccess(true);
    } catch (error: any) {
      setDeleteError(
        error.response?.data?.message || t("settings.deleteAccountError"),
      );
    } finally {
      setIsDeleting(false);
    }
  };

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

      <motion.section className="settings-panel" {...panelAnimation(0.5)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.deleteAccount")}</h3>
            <p>{t("settings.deleteAccountDescription")}</p>
          </div>
          <Trash2 size={22} />
        </div>

        <button
          type="button"
          className="settings-delete-button"
          onClick={() => {
            setDeleteError("");
            setPassword("");
            setShowDeleteDialog(true);
          }}
        >
          <Trash2 size={17} />
          {t("settings.deleteAccountButton")}
        </button>
      </motion.section>

      {deleteSuccess && (
        <div className="settings-delete-overlay">
          <motion.div
            className="settings-delete-dialog"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="status"
          >
            <div className="settings-delete-dialog-heading settings-delete-success">
              <ShieldCheck size={28} />
            </div>

            <h3>{t("settings.deleteAccountSuccess")}</h3>
            <p>{t("settings.deleteAccountSuccessDescription")}</p>

            <div className="settings-delete-dialog-actions">
              <button
                type="button"
                className="settings-delete-confirm-button"
                onClick={logout}
              >
                {t("settings.close")}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="settings-delete-overlay">
          <motion.div
            className="modal-content settings-delete-dialog"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <div className="settings-delete-dialog-heading">
              <AlertTriangle size={28} />
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                aria-label={t("settings.close")}
                disabled={isDeleting}
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="delete-account-title">
              {t("settings.deleteAccountConfirmTitle")}
            </h3>
            <p>{t("settings.deleteAccountConfirmDescription")}</p>

            <label className="settings-delete-password">
              <span>{t("settings.deleteAccountPassword")}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("settings.deleteAccountPasswordPlaceholder")}
                autoComplete="current-password"
                disabled={isDeleting}
              />
            </label>

            {deleteError && (
              <p className="auth-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="settings-delete-dialog-actions">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                {t("settings.cancel")}
              </button>

              <button
                type="button"
                className="settings-delete-confirm-button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting
                  ? t("settings.deletingAccount")
                  : t("settings.confirmDeleteAccount")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

export default SettingsPage;
