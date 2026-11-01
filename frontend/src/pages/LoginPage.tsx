import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
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
    <main className="page-intro">
      <section className="page-panel">
        <div className="page-panel-heading">
          <h2>Logga in</h2>
          <p>Logga in på ditt BookWise-konto.</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="Ange ditt lösenord"
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p>
          Har du inget konto? <Link to="/register">Registrera dig</Link>
        </p>
      </section>
    </main>
  );
}

export default LoginPage;
