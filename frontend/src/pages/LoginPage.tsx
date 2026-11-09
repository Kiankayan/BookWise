import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Tag,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/");
    } catch (error) {
      console.error("Login failed.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(responseError.response?.data?.message ?? t("login.error"));
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
              {t("login.brandDescription")}
            </p>

            <h1>{t("login.heroTitle")}</h1>

            <p>{t("login.heroDescription")}</p>

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
                <span>{t("login.featureManage")}</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <Tag size={13} />
                </span>
                <span>{t("login.featureBorrow")}</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <UserRound size={13} />
                </span>
                <span>{t("login.featureLoans")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <div className="auth-language-switch">
              <button
                type="button"
                className={i18n.language.startsWith("sv") ? "active" : ""}
                onClick={() => i18n.changeLanguage("sv")}
                aria-pressed={i18n.language.startsWith("sv")}
              >
                SV
              </button>

              <button
                type="button"
                className={i18n.language.startsWith("en") ? "active" : ""}
                onClick={() => i18n.changeLanguage("en")}
                aria-pressed={i18n.language.startsWith("en")}
              >
                EN
              </button>
            </div>
            <div className="auth-form-heading">
              <h2>{t("login.title")}</h2>
              <p>{t("login.welcome")}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="email">{t("login.email")}</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("login.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="password">{t("login.password")}</label>

                <div className="auth-input-wrapper auth-password-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("login.passwordPlaceholder")}
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword
                        ? t("login.hidePassword")
                        : t("login.showPassword")
                    }
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="auth-remember-me">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                    />
                    {t("login.rememberMe")}
                  </label>
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
                {isLoading ? t("login.loading") : t("login.submit")}
              </button>
            </form>

            <p className="auth-switch-link">
              {t("login.noAccount")}{" "}
              <Link to="/register">{t("login.register")}</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
