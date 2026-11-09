import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { Users, ShieldCheck, UserRound, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/UserService";
import { useAuth } from "../context/AuthContext";
import type { ManagedUser } from "../types/user";

function UsersPage() {
  const { t, i18n } = useTranslation();
  const { user: currentUser } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [userUpdateError, setUserUpdateError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await getUsers();
        setUsers(response.data.users);
        setError("");
      } catch (error) {
        console.error("Could not load users.", error);
        setError(t("usersPage.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [t]);

  async function handleRoleChange(userId: string, role: ManagedUser["role"]) {
    setUpdatingUserId(userId);
    setUserUpdateError("");

    try {
      const response = await updateUserRole(userId, role);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? response.data.user : user,
        ),
      );
    } catch (error) {
      console.error("Could not change user role.", error);
      setUserUpdateError(t("usersPage.updateRoleError"));
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleStatusChange(userId: string, isActive: boolean) {
    setUpdatingUserId(userId);
    setUserUpdateError("");

    try {
      const response = await updateUserStatus(userId, isActive);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? response.data.user : user,
        ),
      );
    } catch (error) {
      console.error("Could not change account status.", error);
      setUserUpdateError(t("usersPage.updateStatusError"));
    } finally {
      setUpdatingUserId(null);
    }
  }

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

  const stats = [
    {
      label: t("usersPage.totalUsers"),
      value: users.length,
      icon: Users,
    },
    {
      label: t("usersPage.administrators"),
      value: adminCount,
      icon: ShieldCheck,
    },
    {
      label: t("usersPage.regularUsers"),
      value: regularUserCount,
      icon: UserRound,
    },
  ];

  if (isLoading) return null;

  return (
    <motion.div
      className="users-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("usersPage.eyebrow")}</p>
        <h2>{t("usersPage.title")}</h2>
        <p>{t("usersPage.description")}</p>
      </section>

      {error ? (
        <section className="users-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <section
            className="users-stats"
            aria-label={t("usersPage.statisticsLabel")}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.article
                  className="users-stat-card"
                  key={stat.label}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: shouldReduceMotion ? 0 : index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <div className="users-stat-icon">
                    <Icon size={21} strokeWidth={1.8} />
                  </div>
                  <p className="users-stat-label">{stat.label}</p>
                  <p className="users-stat-value">{stat.value}</p>
                </motion.article>
              );
            })}
          </section>

          <motion.section
            className="users-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: shouldReduceMotion ? 0 : 0.25,
              ease: "easeOut",
            }}
          >
            <div className="users-panel-heading">
              <div>
                <h3>{t("usersPage.userList")}</h3>
                <p>
                  {t("usersPage.usersDisplayed", {
                    count: filteredUsers.length,
                  })}
                </p>
              </div>
              <Users size={22} />
            </div>

            <div className="users-search">
              <Search size={18} />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("usersPage.searchPlaceholder")}
                aria-label={t("usersPage.searchLabel")}
              />
            </div>

            {userUpdateError && (
              <p className="users-error" role="alert">
                {userUpdateError}
              </p>
            )}

            {filteredUsers.length === 0 ? (
              <p className="users-empty">{t("usersPage.noUsersFound")}</p>
            ) : (
              <div className="users-list">
                {filteredUsers.map((user, index) => {
                  const isCurrentUser = user.id === currentUser?.id;
                  const isUpdating = updatingUserId === user.id;

                  return (
                    <motion.article
                      className="users-item"
                      key={user.id}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: shouldReduceMotion ? 0 : 0.3 + index * 0.06,
                        ease: "easeOut",
                      }}
                    >
                      <div className="users-item-main">
                        <div className="users-avatar">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={t("usersPage.profilePictureAlt", {
                                name: user.name,
                              })}
                            />
                          ) : user.gender === "MAN" ? (
                            <img
                              src="/images/avatar-man.png"
                              alt={t("usersPage.profilePictureAlt", {
                                name: user.name,
                              })}
                            />
                          ) : user.gender === "WOMAN" ? (
                            <img
                              src="/images/avatar-woman.png"
                              alt={t("usersPage.profilePictureAlt", {
                                name: user.name,
                              })}
                            />
                          ) : (
                            <UserRound size={21} />
                          )}
                        </div>

                        <div className="users-item-info">
                          <div className="users-item-title">
                            <h4>
                              <Link to={`/users/${user.id}`}>{user.name}</Link>
                            </h4>
                            <span
                              className={`users-status ${
                                user.isActive ? "is-active" : "is-inactive"
                              }`}
                            >
                              {user.isActive
                                ? t("usersPage.active")
                                : t("usersPage.inactive")}
                            </span>
                          </div>

                          <p className="users-email">{user.email}</p>

                          <p className="users-registered">
                            {t("usersPage.registered")}{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              i18n.language.startsWith("sv")
                                ? "sv-SE"
                                : "en-GB",
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="users-item-actions">
                        <button
                          type="button"
                          className={`users-status-button ${
                            user.isActive ? "is-deactivate" : "is-activate"
                          }`}
                          disabled={isCurrentUser || isUpdating}
                          onClick={() =>
                            void handleStatusChange(user.id, !user.isActive)
                          }
                        >
                          {isUpdating
                            ? t("usersPage.updating")
                            : isCurrentUser
                              ? t("usersPage.ownAccount")
                              : user.isActive
                                ? t("usersPage.deactivateAccount")
                                : t("usersPage.activateAccount")}
                        </button>

                        <label className="users-role-control">
                          <span>{t("usersPage.userRole")}</span>
                          <select
                            value={user.role}
                            disabled={isCurrentUser || isUpdating}
                            onChange={(event) =>
                              void handleRoleChange(
                                user.id,
                                event.target.value as ManagedUser["role"],
                              )
                            }
                          >
                            <option value="USER">{t("usersPage.user")}</option>
                            <option value="ADMIN">
                              {t("usersPage.administrator")}
                            </option>
                          </select>
                        </label>
                      </div>

                      {isCurrentUser && (
                        <p className="users-own-account">
                          {t("usersPage.ownAccountWarning")}
                        </p>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.section>
        </>
      )}
    </motion.div>
  );
}

export default UsersPage;
