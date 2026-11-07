import { motion } from "motion/react";
import { UserRound, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ProfilePage() {
  const { user } = useAuth();
  console.log("Inloggad användare:", user);

  const roleLabel = user?.role === "ADMIN" ? "Administratör" : "Användare";

  const avatar =
    user?.gender === "MAN"
      ? "/images/avatar-man.png"
      : user?.gender === "WOMAN"
        ? "/images/avatar-woman.png"
        : null;

  const profileDetails = [
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

      <section className="page-panel">
        <div className="page-panel-heading">
          <div>
            <h3>Profilinformation</h3>
            <p>Dina registrerade kontouppgifter.</p>
          </div>

          {avatar && (
            <img
              className="profile-avatar"
              src={avatar}
              alt={`Profilbild för ${user?.name}`}
            />
          )}
        </div>

        <div className="profile-details">
          {profileDetails.map((detail) => {
            const Icon = detail.icon;

            return (
              <div className="profile-detail" key={detail.label}>
                <div className="dashboard-stat-icon">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="dashboard-stat-label">{detail.label}</p>
                  <p>{detail.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default ProfilePage;
