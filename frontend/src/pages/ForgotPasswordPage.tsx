import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail } from "lucide-react";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import AuthLanguageSwitch from "../components/auth/AuthLanguageSwitch";
import { forgotPasswordUser } from "../services/AuthService";

function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSuccess(false);
    setError(false);
    setIsLoading(true);

    try {
      await forgotPasswordUser(email);
      setIsSuccess(true);
    } catch {
      setError(true);
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
              <h2>{t("forgotPassword.title")}</h2>
              <p>{t("forgotPassword.description")}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="email">{t("forgotPassword.email")}</label>

                <div className="auth-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("forgotPassword.emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              {isSuccess && (
                <p className="auth-success" role="status">
                  {t("forgotPassword.success")}
                </p>
              )}

              {error && (
                <p className="auth-error" role="alert">
                  {t("forgotPassword.error")}
                </p>
              )}

              <button
                className="auth-submit-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading
                  ? t("forgotPassword.loading")
                  : t("forgotPassword.submit")}
              </button>
            </form>

            <p className="auth-switch-link">
              <Link to="/login">{t("forgotPassword.backToLogin")}</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
