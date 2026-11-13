import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LockKeyhole } from "lucide-react";
import AuthBrandPanel from "../components/auth/AuthBrandPanel";
import AuthLanguageSwitch from "../components/auth/AuthLanguageSwitch";
import { resetPasswordUser } from "../services/AuthService";
import axios from "axios";

function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSuccess(false);
    setError("");

    if (!token) {
      setError("resetPassword.invalidLink");
      return;
    }

    if (password !== confirmPassword) {
      setError("resetPassword.passwordMismatch");
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordUser(token, password);
      setIsSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === "SAME_PASSWORD"
      ) {
        setError("resetPassword.samePassword");
      } else {
        setError("resetPassword.error");
      }
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
              <h2>{t("resetPassword.title")}</h2>
              <p>{t("resetPassword.description")}</p>
            </div>

            {token ? (
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-form-group">
                  <label htmlFor="password">
                    {t("resetPassword.password")}
                  </label>

                  <div className="auth-input-wrapper">
                    <LockKeyhole size={18} />

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t("resetPassword.passwordPlaceholder")}
                      minLength={8}
                      maxLength={72}
                      required
                    />
                  </div>
                </div>

                <div className="auth-form-group">
                  <label htmlFor="confirmPassword">
                    {t("resetPassword.confirmPassword")}
                  </label>

                  <div className="auth-input-wrapper">
                    <LockKeyhole size={18} />

                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder={t(
                        "resetPassword.confirmPasswordPlaceholder",
                      )}
                      minLength={8}
                      maxLength={72}
                      required
                    />
                  </div>
                </div>

                {isSuccess && (
                  <p className="auth-success" role="status">
                    {t("resetPassword.success")}
                  </p>
                )}

                {error && (
                  <p className="auth-error" role="alert">
                    {t(error)}
                  </p>
                )}

                {!isSuccess && (
                  <button
                    className="auth-submit-button"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? t("resetPassword.loading")
                      : t("resetPassword.submit")}
                  </button>
                )}
              </form>
            ) : (
              <p className="auth-error" role="alert">
                {t("resetPassword.invalidLink")}
              </p>
            )}

            <p className="auth-switch-link">
              <Link to="/login">{t("resetPassword.backToLogin")}</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
