import { useEffect, useState } from "react";
import { ChartNoAxesCombined, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type DashboardStat = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  description: string;
};

type DashboardStatsProps = {
  stats: DashboardStat[];
  percentageChanges: Record<string, number>;
  shouldReduceMotion: boolean | null;
  locale: string;
  ariaLabel: string;
};

function AnimatedPercentage({
  value,
  shouldReduceMotion,
  locale,
}: {
  value: number;
  shouldReduceMotion: boolean | null;
  locale: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 2000;
    const startTime = performance.now();
    let animationFrame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Number((value * easedProgress).toFixed(1)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    setDisplayValue(0);
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, shouldReduceMotion]);

  return (
    <>
      {displayValue > 0 ? "+" : ""}
      {displayValue.toLocaleString(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}
      %
    </>
  );
}

function DashboardStats({
  stats,
  percentageChanges,
  shouldReduceMotion,
  locale,
  ariaLabel,
}: DashboardStatsProps) {
  return (
    <section className="dashboard-stats" aria-label={ariaLabel}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const percentage = percentageChanges[stat.key];

        return (
          <article className="dashboard-stat-card" key={stat.key}>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: shouldReduceMotion ? 0 : 0.2 + index * 0.12,
                ease: "easeOut",
              }}
            >
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={1.8} />
                </span>

                <span
                  className={`dashboard-stat-change ${
                    percentage > 0
                      ? "is-positive"
                      : percentage < 0
                        ? "is-negative"
                        : "is-neutral"
                  }`}
                >
                  {percentage > 0 ? (
                    <TrendingUp size={14} strokeWidth={2.5} />
                  ) : percentage < 0 ? (
                    <TrendingDown size={14} strokeWidth={2.5} />
                  ) : (
                    <ChartNoAxesCombined size={14} strokeWidth={2.5} />
                  )}

                  <span>
                    <AnimatedPercentage
                      value={percentage}
                      shouldReduceMotion={shouldReduceMotion}
                      locale={locale}
                    />
                  </span>
                </span>
              </div>

              <p className="dashboard-stat-label">{stat.label}</p>
              <p className="dashboard-stat-value">{stat.value}</p>
              <p className="dashboard-stat-description">{stat.description}</p>
            </motion.div>
          </article>
        );
      })}
    </section>
  );
}

export default DashboardStats;
