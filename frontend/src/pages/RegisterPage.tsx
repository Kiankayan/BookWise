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
    <main className="page-intro">
      <section className="page-panel">
        <div className="page-panel-heading">
          <h2>Skapa konto</h2>
          <p>Registrera ett nytt BookWise-konto.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Namn</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ange ditt namn"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-postadress</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ange din e-postadress"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Skapa ett lösenord"
              minLength={8}
              maxLength={72}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Bekräfta lösenord</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Ange lösenordet igen"
              minLength={8}
              maxLength={72}
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Skapar konto..." : "Registrera"}
          </button>
        </form>

        <p>
          Har du redan ett konto? <Link to="/login">Logga in</Link>
        </p>
      </section>
    </main>
  );
}

export default RegisterPage;
