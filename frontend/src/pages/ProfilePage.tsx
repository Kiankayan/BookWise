import { motion } from "motion/react";
import { UserRound, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

  const avatar =
    user?.avatarUrl ??
    (user?.gender === "MAN"
      ? "/images/avatar-man.png"
      : user?.gender === "WOMAN"
        ? "/images/avatar-woman.png"
        : null);

  const personalDetails = [
    {
      label: "Fullständigt namn",
      value: user?.name ?? "Inte tillgängligt",
      icon: UserRound,
    },
    {
      label: "E-postadress",
      value: user?.email ?? "Inte tillgängligt",
      icon: Mail,
    },
  ];

  const accountDetails = [
    {
      label: "Kontotyp",
      value: roleLabel,
      icon: ShieldCheck,
    },
    {
      label: "Användar-ID",
      value: user?.id ?? "Inte tillgängligt",
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
        <p className="eyebrow">DITT KONTO</p>
        <h2>Min profil</h2>
        <p>Här hittar du information om ditt BookWise-konto.</p>
      </section>

      <section className="profile-hero-card">
        <div className="profile-hero-avatar">
          {avatar ? (
            <img src={avatar} alt={`Profilbild för ${user?.name}`} />
          ) : (
            <UserRound size={42} />
          )}
        </div>

        <div className="profile-hero-info">
          <p className="eyebrow">DIN PROFIL</p>
          <h3>{user?.name ?? "Användare"}</h3>
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
              <h3>Personuppgifter</h3>
              <p>Dina registrerade kontaktuppgifter.</p>
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
              <h3>Kontoinformation</h3>
              <p>Information om ditt BookWise-konto.</p>
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
