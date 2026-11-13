import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

type UserDashboardOverviewProps = {
  loanCount: number;
  shouldReduceMotion: boolean | null;
};

function UserDashboardOverview({
  loanCount,
  shouldReduceMotion,
}: UserDashboardOverviewProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="dashboard-overview-card">
      <div className="dashboard-overview-content">
        <p className="eyebrow">{t("userDashboard.overviewEyebrow")}</p>
        <h3>{t("userDashboard.overviewTitle")}</h3>
        <p>
          {t("userDashboard.overviewDescription", {
            loanCount,
          })}
        </p>

        <button
          className="dashboard-library-button"
          type="button"
          onClick={() => navigate("/library")}
        >
          {t("dashboard.exploreLibrary")}
          <span aria-hidden="true">→</span>
        </button>
      </div>

      <motion.img
        className="dashboard-overview-illustration"
        src="/images/dashboard-book-stack.png"
        alt=""
        aria-hidden="true"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: [0, -5, 0],
                rotate: [0, 1, 0],
              }
        }
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </section>
  );
}

export default UserDashboardOverview;
