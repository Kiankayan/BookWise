import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { getUsers } from "../services/UserService";
import type { ManagedUser } from "../types/user";

function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await getUsers();
        setUsers(response.data.users);
        setError("");
      } catch (error) {
        console.error("Kunde inte hämta användare.", error);
        setError("Kunde inte hämta användare. Försök igen senare.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue),
    );
  }, [users, search]);

  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const regularUserCount = users.filter((user) => user.role === "USER").length;

  return (
    <motion.div
      className="users-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">ADMINISTRATION</p>
        <h2>Användare</h2>
        <p>Hantera registrerade användare och deras behörigheter.</p>
      </section>

      {isLoading ? (
        <section className="page-panel">
          <p>Hämtar användare...</p>
        </section>
      ) : error ? (
        <section className="page-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <section className="dashboard-stats" aria-label="Användarstatistik">
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Totalt antal användare</p>
              <p className="dashboard-stat-value">{users.length}</p>
            </article>

            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Administratörer</p>
              <p className="dashboard-stat-value">{adminCount}</p>
            </article>

            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Vanliga användare</p>
              <p className="dashboard-stat-value">{regularUserCount}</p>
            </article>
          </section>

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>Användarlista</h3>
                <p>{filteredUsers.length} användare visas</p>
              </div>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Sök efter namn eller e-postadress..."
              aria-label="Sök användare"
            />

            {filteredUsers.length === 0 ? (
              <p>Inga användare hittades.</p>
            ) : (
              <div>
                {filteredUsers.map((user) => (
                  <article key={user.id}>
                    <div>
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <p>
                        Roll:{" "}
                        {user.role === "ADMIN" ? "Administratör" : "Användare"}
                      </p>
                      <p>
                        Registrerad:{" "}
                        {new Date(user.createdAt).toLocaleDateString("sv-SE")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}

export default UsersPage;
