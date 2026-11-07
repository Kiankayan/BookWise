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
import { registerUser } from "../services/AuthService";

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"MAN" | "WOMAN">("MAN");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        gender,
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
              <h2>Skapa konto</h2>
              <p>Skapa ett konto för att börja använda BookWise.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-form-group">
                <label htmlFor="name">Namn</label>
                <div className="auth-input-wrapper">
                  <UserRound size={18} />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ange ditt namn"
                    required
                  />
                </div>
              </div>

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
                <label>Kön</label>
                <div className="auth-gender-options">
                  <label className="auth-gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="MAN"
                      checked={gender === "MAN"}
                      onChange={() => setGender("MAN")}
                    />
                    <span>Man</span>
                  </label>

                  <label className="auth-gender-option">
                    <input
                      type="radio"
                      name="gender"
                      value="WOMAN"
                      checked={gender === "WOMAN"}
                      onChange={() => setGender("WOMAN")}
                    />
                    <span>Kvinna</span>
                  </label>
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
                    placeholder="Minst 8 tecken"
                    minLength={8}
                    maxLength={72}
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
              </div>

              <div className="auth-form-group">
                <label htmlFor="confirmPassword">Bekräfta lösenord</label>

                <div className="auth-input-wrapper auth-password-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Ange ditt lösenord igen"
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
                {isLoading ? "Skapar konto..." : "Registrera konto"}
              </button>
            </form>

            <p className="auth-switch-link">
              Har du inget konto? <Link to="/login">Logga in</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
