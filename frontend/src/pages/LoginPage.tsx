import { useState, type FormEvent } from "react";
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

function LoginPage() {
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
      console.error("Inloggningen misslyckades.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        responseError.response?.data?.message ??
          "Fel e-postadress eller lösenord. Försök igen.",
      );
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
            <p className="auth-brand-description">Bibliotekshantering</p>

            <h1>Upptäck en värld av kunskap.</h1>

            <p>
              Organisera ditt bibliotek, hantera dina böcker och håll koll på
              allt på ett och samma ställe.
            </p>

            <img
              className="auth-illustration"
              src="/images/bookwise-auth-illustration.png"
              alt="Illustration of books representing BookWise"
            />

            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <BookOpen size={13} />
                </span>
                <span>Hantera bibliotekets material</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <Tag size={13} />
                </span>
                <span>Låna och returnera</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">
                  <UserRound size={13} />
                </span>
                <span>Håll koll på dina lån</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <div className="auth-form-heading">
              <h2>Logga in</h2>
              <p>Välkommen tillbaka till BookWise.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="email">E-post</label>
                <div className="auth-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Ange din e-postadress"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="password">Lösenord</label>

                <div className="auth-input-wrapper auth-password-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ange ditt lösenord"
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Dölj lösenord" : "Visa lösenord"
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
                    Kom ihåg mig
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
                {isLoading ? "Loggar in..." : "Logga in"}
              </button>
            </form>

            <p className="auth-switch-link">
              Har du inget konto? <Link to="/register">Registrera dig</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
