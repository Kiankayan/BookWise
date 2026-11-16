import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  Shield,
  ShieldAlert,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  getUserById,
  deleteUser,
  updateUserStatus,
} from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import type { ManagedUser } from "../types/user";

function UserDetailsPage() {
  const { t, i18n } = useTranslation();
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
        setError(t("users.details.invalidId"));
        setIsLoading(false);
        return;
      }

      try {
        const response = await getUserById(id);
        setUser(response.data.user);
      } catch (error) {
        console.error("Could not fetch user.", error);
        setError(t("users.details.fetchError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, [id, t]);

  useEffect(() => {
    if (!isConfirmingDelete) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) {
        setIsConfirmingDelete(false);
        setDeleteError("");
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isConfirmingDelete, isDeleting]);

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
      console.error("Could not update account status.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setStatusError(
        responseError.response?.data?.message ?? t("users.details.statusError"),
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
      console.error("Could not delete user.", error);

      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setDeleteError(
        responseError.response?.data?.message ?? t("users.details.deleteError"),
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const isOwnAccount = user?.id === currentUser?.id;

  const avatar =
    user?.avatarUrl ??
    (user?.gender === "MAN"
      ? "/images/avatar-man.png"
      : user?.gender === "WOMAN"
        ? "/images/avatar-woman.png"
        : null);

  const roleLabel =
    user?.role === "ADMIN" ? t("users.details.admin") : t("users.details.user");

  return (
    <motion.div
      className="users-page user-details-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("users.details.eyebrow")}</p>
        <h2>{t("users.details.title")}</h2>
        <p>{t("users.details.subtitle")}</p>
      </section>

      {isLoading ? (
        <section className="user-details-loading">
          <span className="user-details-spinner" />
          <p>{t("users.details.loading")}</p>
        </section>
      ) : error ? (
        <section className="user-details-error" role="alert">
          <ShieldAlert size={22} />
          <p>{error}</p>
          <Link to="/users">{t("users.details.backToUsers")}</Link>
        </section>
      ) : user ? (
        <>
          <section className="user-details-profile">
            <div className="user-details-profile-main">
              <div className="user-details-avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={t("users.details.profileImage", {
                      name: user.name,
                    })}
                  />
                ) : (
                  <UserRound size={34} />
                )}
              </div>

              <div className="user-details-identity">
                <div className="user-details-name-row">
                  <h3>{user.name}</h3>
                  <span
                    className={`users-status ${
                      user.isActive ? "is-active" : "is-inactive"
                    }`}
                  >
                    {user.isActive
                      ? t("users.details.activeAccount")
                      : t("users.details.inactiveAccount")}
                  </span>
                </div>

                <p>{user.email}</p>

                <span className="user-details-role">
                  <Shield size={14} />
                  {roleLabel}
                </span>
              </div>
            </div>

            <div className="user-details-profile-badge">
              <UserRound size={19} />
              <span>{t("users.details.account")}</span>
            </div>
          </section>

          <section className="user-details-panel">
            <div className="user-details-section-heading">
              <div>
                <h3>{t("users.details.accountInformation")}</h3>
                <p>{t("users.details.accountDescription")}</p>
              </div>
              <UserRound size={21} />
            </div>

            <div className="user-details-info-grid">
              <div className="user-details-info-card">
                <span className="user-details-info-icon">
                  <UserRound size={19} />
                </span>
                <div>
                  <span>{t("users.details.fullName")}</span>
                  <strong>{user.name}</strong>
                </div>
              </div>

              <div className="user-details-info-card">
                <span className="user-details-info-icon">
                  <Mail size={19} />
                </span>
                <div>
                  <span>{t("users.details.email")}</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="user-details-info-card">
                <span className="user-details-info-icon">
                  <Shield size={19} />
                </span>
                <div>
                  <span>{t("users.details.role")}</span>
                  <strong>{roleLabel}</strong>
                </div>
              </div>

              <div className="user-details-info-card">
                <span className="user-details-info-icon">
                  {user.isActive ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <Clock3 size={19} />
                  )}
                </span>
                <div>
                  <span>{t("users.details.accountStatus")}</span>
                  <strong>
                    {user.isActive
                      ? t("users.details.active")
                      : t("users.details.inactive")}
                  </strong>
                </div>
              </div>

              <div className="user-details-info-card">
                <span className="user-details-info-icon">
                  <CalendarDays size={19} />
                </span>
                <div>
                  <span>{t("users.details.registered")}</span>
                  <strong>
                    {new Date(user.createdAt).toLocaleDateString(
                      i18n.language.startsWith("sv") ? "sv-SE" : "en-GB",
                    )}
                  </strong>
                </div>
              </div>

              <div className="user-details-info-card user-details-id-card">
                <span className="user-details-info-icon">
                  <Shield size={19} />
                </span>
                <div>
                  <span>{t("users.details.userId")}</span>
                  <strong>{user.id}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="user-details-panel user-details-actions-panel">
            <div className="user-details-section-heading">
              <div>
                <h3>{t("users.details.adminActions")}</h3>
                <p>{t("users.details.adminActionsDescription")}</p>
              </div>
              <Shield size={21} />
            </div>

            {isOwnAccount ? (
              <div className="user-details-own-account">
                <ShieldAlert size={19} />
                <p>{t("users.details.ownAccountNotice")}</p>
              </div>
            ) : (
              <div className="user-details-actions">
                <div className="user-details-action-item">
                  <div>
                    <strong>
                      {user.isActive
                        ? t("users.details.deactivateAccount")
                        : t("users.details.activateAccount")}
                    </strong>
                    <p>
                      {user.isActive
                        ? t("users.details.deactivateDescription")
                        : t("users.details.activateDescription")}
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`user-details-status-action ${
                      user.isActive ? "is-deactivate" : "is-activate"
                    }`}
                    disabled={isUpdatingStatus}
                    onClick={() => void handleStatusChange()}
                  >
                    {isUpdatingStatus
                      ? t("users.details.updating")
                      : user.isActive
                        ? t("users.details.deactivate")
                        : t("users.details.activate")}
                  </button>
                </div>

                {statusError && (
                  <p className="user-details-action-error" role="alert">
                    {statusError}
                  </p>
                )}

                <div className="user-details-action-item user-details-delete-item">
                  <div>
                    <strong>{t("users.details.deleteUser")}</strong>
                    <p>{t("users.details.deleteUserDescription")}</p>
                  </div>

                  <button
                    type="button"
                    className="user-details-delete-button"
                    onClick={() => {
                      setIsConfirmingDelete(true);
                      setDeleteError("");
                    }}
                  >
                    <Trash2 size={16} />
                    {t("users.details.deleteAccount")}
                  </button>
                </div>
              </div>
            )}
          </section>

          <Link className="user-details-back-link" to="/users">
            <ArrowLeft size={17} />
            {t("users.details.backToUsers")}
          </Link>

          <AnimatePresence>
            {isConfirmingDelete && (
              <motion.div
                className="user-delete-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                  if (event.target === event.currentTarget && !isDeleting) {
                    setIsConfirmingDelete(false);
                    setDeleteError("");
                  }
                }}
              >
                <motion.section
                  className="user-delete-modal"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="user-delete-title"
                  aria-describedby="user-delete-description"
                  initial={{ opacity: 0, y: 18, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className="user-delete-modal-close"
                    aria-label={t("users.details.close")}
                    disabled={isDeleting}
                    onClick={() => {
                      setIsConfirmingDelete(false);
                      setDeleteError("");
                    }}
                  >
                    <X size={19} />
                  </button>

                  <div className="user-delete-modal-icon">
                    <Trash2 size={25} />
                  </div>

                  <h3 id="user-delete-title">
                    {t("users.details.confirmDeleteTitle")}
                  </h3>

                  <p id="user-delete-description">
                    {t("users.details.confirmDeleteDescription", {
                      name: user.name,
                    })}
                  </p>

                  <div className="user-delete-modal-notice">
                    <ShieldAlert size={18} />
                    <span>{t("users.details.deleteNotice")}</span>
                  </div>

                  {deleteError && (
                    <p className="user-details-action-error" role="alert">
                      {deleteError}
                    </p>
                  )}

                  <div className="user-delete-modal-actions">
                    <button
                      type="button"
                      className="user-delete-cancel-button"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsConfirmingDelete(false);
                        setDeleteError("");
                      }}
                    >
                      {t("users.details.cancel")}
                    </button>

                    <button
                      type="button"
                      className="user-delete-confirm-button"
                      disabled={isDeleting}
                      onClick={() => void handleDeleteUser()}
                    >
                      <Trash2 size={16} />
                      {isDeleting
                        ? t("users.details.deleting")
                        : t("users.details.confirmDelete")}
                    </button>
                  </div>
                </motion.section>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : null}
    </motion.div>
  );
}

export default UserDetailsPage;
