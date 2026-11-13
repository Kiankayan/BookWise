import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import AuthLanguageSwitch from "../components/auth/AuthLanguageSwitch";

function LoginPage() {
  const { t } = useTranslation();
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
        <AuthBrandPanel variant="login" />

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <AuthLanguageSwitch />

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
