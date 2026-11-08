import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Bell,
  Moon,
  Sun,
  ShieldCheck,
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

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

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
      setAvatarError("Välj en JPG-, PNG- eller WebP-bild.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Bilden får vara högst 5 MB.");
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
      setAvatarSuccess("Profilbilden har uppdaterats.");
    } catch {
      setAvatarError("Det gick inte att uppdatera profilbilden. Försök igen.");
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
        <p className="eyebrow">PERSONLIGT</p>
        <h2>Inställningar</h2>
        <p>Anpassa dina personliga inställningar i BookWise.</p>
      </section>

      <motion.section className="settings-panel" {...panelAnimation(0.05)}>
        <div className="settings-panel-heading">
          <div>
            <h3>Profilbild</h3>
            <p>Hantera din personliga profilbild.</p>
          </div>
          <ImagePlus size={22} />
        </div>

        <div className="settings-avatar-section">
          <div className="settings-avatar-preview">
            {displayedAvatar ? (
              <img src={displayedAvatar} alt="Profilbild" />
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
              Välj bild
            </button>

            {user?.avatarUrl && !removeAvatar && (
              <button
                type="button"
                className="settings-avatar-remove-button"
                onClick={handleRemoveAvatar}
                disabled={isSavingAvatar}
              >
                <X size={16} />
                Ta bort bild
              </button>
            )}

            <p>JPG, PNG eller WebP. Max 5 MB.</p>
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
            {isSavingAvatar ? "Sparar..." : "Spara profilbild"}
          </button>
        )}
      </motion.section>

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
