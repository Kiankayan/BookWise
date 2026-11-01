import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { getUserById } from "../services/UserService";
import type { ManagedUser } from "../types/user";

function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        setError("Ogiltigt användar-ID.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserById(id);
        setUser(response.data.user);
      } catch (error) {
        console.error("Kunde inte hämta användaren.", error);
        setError("Kunde inte hämta användarens uppgifter.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [id]);

  return (
    <motion.div
      className="users-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">ADMINISTRATION</p>
        <h2>Användardetaljer</h2>
        <p>Visa information om det registrerade användarkontot.</p>
      </section>

      <section className="page-panel">
        {isLoading ? (
          <p>Hämtar användaruppgifter...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : user ? (
          <>
            <div className="page-panel-heading">
              <div>
                <h3>{user.name}</h3>
                <p>{user.role === "ADMIN" ? "Administratör" : "Användare"}</p>
              </div>
            </div>

            <div>
              <p>
                <strong>Fullständigt namn:</strong> {user.name}
              </p>
              <p>
                <strong>E-postadress:</strong> {user.email}
              </p>
              <p>
                <strong>Användarroll:</strong>{" "}
                {user.role === "ADMIN" ? "Administratör" : "Användare"}
              </p>
              <p>
                <strong>Användar-ID:</strong> {user.id}
              </p>
              <p>
                <strong>Registrerad:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </div>
          </>
        ) : null}

        <Link to="/users">Tillbaka till användarlistan</Link>
      </section>
    </motion.div>
  );
}

export default UserDetailsPage;
