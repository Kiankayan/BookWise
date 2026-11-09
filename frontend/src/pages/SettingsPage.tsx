import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Moon,
  Sun,
  ShieldCheck,
  Languages,
  ImagePlus,
  X,
  UserRound,
  Save,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { uploadAvatarImage } from "../services/ImageUploadService";
import { updateMyProfile } from "../services/UserService";

function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [overdueNotifications, setOverdueNotifications] = useState(true);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleLabel =
    user?.role === "ADMIN" ? t("settings.administrator") : t("settings.user");

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarError("");
    setAvatarSuccess("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError(t("settings.invalidImageFormat"));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t("settings.imageTooLarge"));
      event.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveAvatar = async () => {
    if (!user || (!avatarFile && !removeAvatar)) return;

    setIsSavingAvatar(true);
    setAvatarError("");
    setAvatarSuccess("");

    try {
      const avatarUrl = avatarFile ? await uploadAvatarImage(avatarFile) : null;

      const response = await updateMyProfile({
        name: user.name,
        email: user.email,
        avatarUrl,
      });

      updateUser(response.data.user);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setAvatarSuccess(t("settings.imageUpdated"));
    } catch {
      setAvatarError(t("settings.imageUpdateError"));
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const currentAvatar = user?.avatarUrl
    ? user.avatarUrl
    : user?.gender === "MAN"
      ? "/images/avatar-man.png"
      : user?.gender === "WOMAN"
        ? "/images/avatar-woman.png"
        : null;

  const displayedAvatar =
    avatarPreview || (removeAvatar ? null : currentAvatar);

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

      <motion.section className="settings-panel" {...panelAnimation(0.05)}>
        <div className="settings-panel-heading">
          <div>
            <h3>{t("settings.profilePicture")}</h3>
            <p>{t("settings.profilePictureDescription")}</p>
          </div>
          <ImagePlus size={22} />
        </div>

        <div className="settings-avatar-section">
          <div className="settings-avatar-preview">
            {displayedAvatar ? (
              <img src={displayedAvatar} alt={t("settings.avatarAlt")} />
            ) : (
              <UserRound size={38} />
            )}
          </div>

          <div className="settings-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              hidden
            />

            <button
              type="button"
              className="settings-avatar-select-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSavingAvatar}
            >
              <ImagePlus size={16} />
              {t("settings.chooseImage")}
            </button>

            {user?.avatarUrl && !removeAvatar && (
              <button
                type="button"
                className="settings-avatar-remove-button"
                onClick={handleRemoveAvatar}
                disabled={isSavingAvatar}
              >
                <X size={16} />
                {t("settings.removeImage")}
              </button>
            )}

            <p>{t("settings.imageFormats")}</p>
          </div>
        </div>

        {avatarError && (
          <p className="settings-avatar-message error">{avatarError}</p>
        )}

        {avatarSuccess && (
          <p className="settings-avatar-message success">{avatarSuccess}</p>
        )}

        {(avatarFile || removeAvatar) && (
          <button
            type="button"
            className="settings-avatar-save-button"
            onClick={handleSaveAvatar}
            disabled={isSavingAvatar}
          >
            <Save size={16} />
            {isSavingAvatar ? t("settings.saving") : t("settings.saveImage")}
          </button>
        )}
      </motion.section>

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
