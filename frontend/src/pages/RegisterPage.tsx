import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/AuthService";

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
      });

      navigate("/login");
    } catch {
      setError(
        "Kunde inte skapa kontot. Kontrollera uppgifterna och försök igen.",
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
            <span>BookWise</span>
          </div>

          <div className="auth-brand-content">
            <span className="auth-eyebrow">LIBRARY MANAGEMENT</span>
            <h1>Discover a world of knowledge.</h1>
            <p>
              Organize your library, manage your books and keep track of
              everything in one place.
            </p>

            <img
              className="auth-illustration"
              src="/images/bookwise-auth-illustration.png"
              alt="Illustration of books representing BookWise"
            />

            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Manage your library materials</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Borrow and return books</span>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">✓</span>
                <span>Keep track of your loans</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-content">
            <div className="auth-form-heading">
              <span className="auth-eyebrow">GET STARTED</span>
              <h2>Create your account</h2>
              <p>Create a BookWise account to get started.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="auth-form-group">
                <label htmlFor="password">Password</label>

                <div className="auth-password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className="auth-password-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your password again"
                    minLength={8}
                    maxLength={72}
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
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
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="auth-switch-link">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
