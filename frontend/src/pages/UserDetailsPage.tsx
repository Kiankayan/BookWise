import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  getUserById,
  deleteUser,
  updateUserStatus,
} from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import type { ManagedUser } from "../types/user";

function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

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

  async function handleStatusChange() {
    if (!user) {
      return;
    }

    setIsUpdatingStatus(true);
    setStatusError("");

    try {
      const response = await updateUserStatus(user.id, !user.isActive);
      setUser(response.data.user);
    } catch (error) {
      console.error("Kunde inte ändra kontostatus.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setStatusError(
        responseError.response?.data?.message ??
          "Kunde inte ändra kontostatus. Försök igen.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDeleteUser() {
    if (!user) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteUser(user.id);
      navigate("/users");
    } catch (error) {
      console.error("Kunde inte ta bort användaren.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setDeleteError(
        responseError.response?.data?.message ??
          "Kunde inte ta bort användaren. Försök igen.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

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
                <strong>Kontostatus:</strong>{" "}
                {user.isActive ? "Aktivt" : "Inaktivt"}
              </p>
              <p>
                <strong>Användar-ID:</strong> {user.id}
              </p>
              <p>
                <strong>Registrerad:</strong>{" "}
                {new Date(user.createdAt).toLocaleDateString("sv-SE")}
              </p>
            </div>

            {user.id === currentUser?.id ? (
              <p>Du kan inte inaktivera ditt eget konto.</p>
            ) : (
              <div>
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => void handleStatusChange()}
                >
                  {isUpdatingStatus
                    ? "Uppdaterar..."
                    : user.isActive
                      ? "Inaktivera konto"
                      : "Aktivera konto"}
                </button>

                {statusError && <p role="alert">{statusError}</p>}
              </div>
            )}

            {user.id === currentUser?.id ? (
              <p>Du kan inte ta bort ditt eget konto.</p>
            ) : (
              <div>
                {!isConfirmingDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsConfirmingDelete(true);
                      setDeleteError("");
                    }}
                  >
                    Ta bort användare
                  </button>
                ) : (
                  <div>
                    <h4>Bekräfta borttagning</h4>
                    <p>
                      Är du säker på att du vill ta bort kontot för {user.name}?
                    </p>
                    <p>Användarens tidigare lånehistorik bevaras.</p>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => void handleDeleteUser()}
                    >
                      {isDeleting ? "Tar bort..." : "Ja, ta bort användaren"}
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setIsConfirmingDelete(false)}
                    >
                      Avbryt
                    </button>
                  </div>
                )}

                {deleteError && <p role="alert">{deleteError}</p>}
              </div>
            )}
          </>
        ) : null}

        <Link to="/users">Tillbaka till användarlistan</Link>
      </section>
    </motion.div>
  );
}

export default UserDetailsPage;
