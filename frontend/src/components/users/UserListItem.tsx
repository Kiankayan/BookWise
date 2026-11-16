import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MouseEvent, KeyboardEvent } from "react";
import type { ManagedUser } from "../../types/user";

type UserListItemProps = {
  user: ManagedUser;
  currentUserId?: string;
  isUpdating: boolean;
  index: number;
  onStatusChange: (userId: string, isActive: boolean) => void;
  onRoleChange: (userId: string, role: ManagedUser["role"]) => void;
};

function UserListItem({
  user,
  currentUserId,
  isUpdating,
  index,
  onStatusChange,
  onRoleChange,
}: UserListItemProps) {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const isCurrentUser = user.id === currentUserId;

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a, button, select, input, label")) {
      return;
    }

    navigate(`/users/${user.id}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (
      event.target === event.currentTarget &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      navigate(`/users/${user.id}`);
    }
  };

  return (
    <motion.article
      className="users-item"
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      style={{ cursor: "pointer" }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
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
              {user.isActive ? t("usersPage.active") : t("usersPage.inactive")}
            </span>
          </div>

          <p className="users-email">{user.email}</p>

          <p className="users-registered">
            {t("usersPage.registered")}{" "}
            {new Date(user.createdAt).toLocaleDateString(
              i18n.language.startsWith("sv") ? "sv-SE" : "en-GB",
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
          onClick={() => onStatusChange(user.id, !user.isActive)}
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
              onRoleChange(user.id, event.target.value as ManagedUser["role"])
            }
          >
            <option value="USER">{t("usersPage.user")}</option>
            <option value="ADMIN">{t("usersPage.administrator")}</option>
          </select>
        </label>
      </div>

      {isCurrentUser && (
        <p className="users-own-account">{t("usersPage.ownAccountWarning")}</p>
      )}
    </motion.article>
  );
}

export default UserListItem;
