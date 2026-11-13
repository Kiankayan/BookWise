import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

type DashboardWelcomeProps = {
  shouldReduceMotion: boolean | null;
};

function DashboardWelcome({ shouldReduceMotion }: DashboardWelcomeProps) {
  const { t } = useTranslation();

  const illustrationTransition = {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <section className="dashboard-welcome">
      <div className="dashboard-welcome-content">
        <p className="eyebrow">{t("dashboard.welcomeEyebrow")}</p>
        <h2>{t("dashboard.welcomeTitle")}</h2>
        <p>{t("dashboard.welcomeDescription")}</p>
      </div>

      <div className="dashboard-book-illustration">
        <motion.img
          className="dashboard-welcome-illustration"
          src="/images/dashboard-open-book.png"
          alt=""
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, -6, 0],
                  rotate: [0, 0.5, 0],
                }
          }
          transition={illustrationTransition}
        />

        <motion.img
          className="dashboard-book-page-test"
          src="/images/book-page-test.png"
          alt=""
          aria-hidden="true"
          style={{ transformOrigin: "bottom center" }}
          animate={shouldReduceMotion ? undefined : { rotate: [0, -12, 0] }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </section>
  );
}

export default DashboardWelcome;
