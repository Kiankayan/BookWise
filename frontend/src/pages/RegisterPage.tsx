import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerUser } from "../services/AuthService";
import { uploadAvatarImage } from "../services/ImageUploadService";

function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"MAN" | "WOMAN" | "">("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError(t("register.invalidImageFormat"));
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("register.imageTooLarge"));
      event.target.value = "";
      return;
    }

    setError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (gender === "") {
      setError(t("register.genderRequired"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("register.passwordMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl: string | null = null;

      if (avatarFile) {
        avatarUrl = await uploadAvatarImage(avatarFile);
      }

      await registerUser({
        name,
        email,
        password,
        gender,
        avatarUrl,
      });

      navigate("/login");
    } catch {
      setError(t("register.registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-container">
        <div className="auth-brand-panel">
          <div className="auth-brand">
            <div className="auth-brand-logo">B</div>
            <div className="auth-brand-text">
              <span>BookWise</span>
            </div>
          </div>

          <div className="auth-brand-content">
            <p className="auth-brand-description">
              {t("register.brandDescription")}
            </p>

            <h1>{t("register.heroTitle")}</h1>

            <p>{t("register.heroDescription")}</p>

            <motion.img
              className="auth-illustration"
              src="/images/bookwise-auth-illustration.png"
              alt="Illustration of books representing BookWise"
              animate={{
                y: [0, -12, 0],
                rotate: [0, -1.5, 1.5, 0],
                scale: [1, 1.025, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <BookOpen size={13} />
                </span>
                <span>{t("register.featureManage")}</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <Tag size={13} />
                </span>
                <span>{t("register.featureBorrow")}</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <UserRound size={13} />
                </span>
                <span>{t("register.featureLoans")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <div className="auth-form-heading">
              <h2>{t("register.title")}</h2>
              <p>{t("register.welcome")}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label>{t("register.profilePicture")}</label>

                <div className="auth-avatar-upload">
                  {avatarPreview ? (
                    <div className="auth-avatar-preview">
                      <img src={avatarPreview} alt={t("register.previewAlt")} />

                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        aria-label={t("register.removePicture")}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="auth-avatar-placeholder">
                      <UserRound size={28} />
                    </div>
                  )}

                  <div className="auth-avatar-actions">
                    <button
                      type="button"
                      className="auth-avatar-select-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus size={16} />
                      {t("register.chooseImage")}
                    </button>

                    <span>{t("register.imageFormats")}</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    hidden
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="name">{t("register.name")}</label>
                <div className="auth-input-wrapper">
                  <UserRound size={18} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("register.namePlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="email">{t("register.email")}</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("register.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label>{t("register.gender")}</label>
                <div className="auth-gender-options">
                  <label className="auth-gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="MAN"
                      checked={gender === "MAN"}
                      onChange={() => setGender("MAN")}
                    />
                    <span>{t("register.man")}</span>
                  </label>

                  <label className="auth-gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="WOMAN"
                      checked={gender === "WOMAN"}
                      onChange={() => setGender("WOMAN")}
                    />
                    <span>{t("register.woman")}</span>
                  </label>
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="password">{t("register.password")}</label>

                <div className="auth-input-wrapper auth-password-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("register.passwordPlaceholder")}
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword
                        ? t("register.hidePassword")
                        : t("register.showPassword")
                    }
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirmPassword">
                  {t("register.confirmPassword")}
                </label>

                <div className="auth-input-wrapper auth-password-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t("register.confirmPasswordPlaceholder")}
                    minLength={8}
                    maxLength={72}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="auth-error" role="alert">
                  {error}
                </p>
              )}

              <button
                className="auth-submit-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? t("register.loading") : t("register.submit")}
              </button>
            </form>

            <p className="auth-switch-link">
              {t("register.noAccount")}{" "}
              <Link to="/login">{t("register.login")}</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
