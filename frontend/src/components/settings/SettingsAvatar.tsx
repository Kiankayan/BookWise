import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ImagePlus, X, UserRound, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatarImage } from "../../services/ImageUploadService";
import { updateMyProfile } from "../../services/UserService";

function SettingsAvatar() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <motion.section
      className="settings-panel"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
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
          onClick={() => void handleSaveAvatar()}
          disabled={isSavingAvatar}
        >
          <Save size={16} />
          {isSavingAvatar ? t("settings.saving") : t("settings.saveImage")}
        </button>
      )}
    </motion.section>
  );
}

export default SettingsAvatar;
