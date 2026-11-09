import { motion } from "motion/react";
import { UserRound, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const roleLabel =
    user?.role === "ADMIN"
      ? t("profilePage.administrator")
      : t("profilePage.user");

  const avatar =
    user?.avatarUrl ??
    (user?.gender === "MAN"
      ? "/images/avatar-man.png"
      : user?.gender === "WOMAN"
        ? "/images/avatar-woman.png"
        : null);

  const personalDetails = [
    {
      label: t("profilePage.fullName"),
      value: user?.name ?? t("profilePage.notAvailable"),
      icon: UserRound,
    },
    {
      label: t("profilePage.email"),
      value: user?.email ?? t("profilePage.notAvailable"),
      icon: Mail,
    },
  ];

  const accountDetails = [
    {
      label: t("profilePage.accountType"),
      value: roleLabel,
      icon: ShieldCheck,
    },
    {
      label: t("profilePage.userId"),
      value: user?.id ?? t("profilePage.notAvailable"),
      icon: CalendarDays,
    },
  ];

  return (
    <motion.div
      className="profile-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">{t("profilePage.eyebrow")}</p>
        <h2>{t("profilePage.title")}</h2>
        <p>{t("profilePage.description")}</p>
      </section>

      <section className="profile-hero-card">
        <div className="profile-hero-avatar">
          {avatar ? (
            <img
              src={avatar}
              alt={t("profilePage.avatarAlt", {
                name: user?.name ?? t("profilePage.user"),
              })}
            />
          ) : (
            <UserRound size={42} />
          )}
        </div>

        <div className="profile-hero-info">
          <p className="eyebrow">{t("profilePage.profileEyebrow")}</p>
          <h3>{user?.name ?? t("profilePage.user")}</h3>
          <span className="profile-role-badge">
            <ShieldCheck size={15} />
            {roleLabel}
          </span>
        </div>
      </section>

      <div className="profile-information-grid">
        <section className="page-panel profile-info-card">
          <div className="profile-section-heading">
            <div>
              <h3>{t("profilePage.personalInfo")}</h3>
              <p>{t("profilePage.personalInfoDescription")}</p>
            </div>
          </div>

          <div className="profile-details">
            {personalDetails.map((detail) => {
              const Icon = detail.icon;

              return (
                <div className="profile-detail" key={detail.label}>
                  <div className="profile-detail-icon">
                    <Icon size={20} />
                  </div>
                  <div className="profile-detail-content">
                    <p>{detail.label}</p>
                    <strong>{detail.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="page-panel profile-info-card">
          <div className="profile-section-heading">
            <div>
              <h3>{t("profilePage.accountInfo")}</h3>
              <p>{t("profilePage.accountInfoDescription")}</p>
            </div>
          </div>

          <div className="profile-details">
            {accountDetails.map((detail) => {
              const Icon = detail.icon;

              return (
                <div className="profile-detail" key={detail.label}>
                  <div className="profile-detail-icon">
                    <Icon size={20} />
                  </div>
                  <div className="profile-detail-content">
                    <p>{detail.label}</p>
                    <strong>{detail.value}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default ProfilePage;
