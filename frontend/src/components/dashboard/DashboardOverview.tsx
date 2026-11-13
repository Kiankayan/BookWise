import { motion } from "motion/react";

type DashboardOverviewProps = {
  eyebrow: string;
  title: string;
  description: string;
  exploreLibrary: string;
  shouldReduceMotion: boolean | null;
  onExploreLibrary: () => void;
};

function DashboardOverview({
  eyebrow,
  title,
  description,
  exploreLibrary,
  shouldReduceMotion,
  onExploreLibrary,
}: DashboardOverviewProps) {
  return (
    <section className="dashboard-overview-card">
      <div className="dashboard-overview-content">
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{description}</p>

        <button
          className="dashboard-library-button"
          type="button"
          onClick={onExploreLibrary}
        >
          {exploreLibrary}
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

export default DashboardOverview;
