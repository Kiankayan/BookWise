import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Tags } from "lucide-react";
import { useTranslation } from "react-i18next";

type CategoryLoan = {
  name: string;
  value: number;
};

type UserCategoryChartProps = {
  categories: CategoryLoan[];
  colors: string[];
  totalLoans: number;
  shouldReduceMotion: boolean | null;
  locale: string;
};

function AnimatedCount({
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

    const duration = 2400;
    const startTime = performance.now();
    let animationFrame = 0;

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);

      setDisplayValue(Math.round(value * easedProgress));

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

  return <>{displayValue.toLocaleString(locale)}</>;
}

function UserCategoryChart({
  categories,
  colors,
  totalLoans,
  shouldReduceMotion,
  locale,
}: UserCategoryChartProps) {
  const { t } = useTranslation();

  return (
    <section className="dashboard-category-card">
      <div className="dashboard-category-heading">
        <div className="dashboard-chart-icon" aria-hidden="true">
          <Tags size={20} strokeWidth={1.8} />
        </div>
        <h3>{t("userDashboard.loansByCategory")}</h3>
      </div>

      {categories.length === 0 ? (
        <p>{t("userDashboard.noLoans")}</p>
      ) : (
        <div className="dashboard-category-layout">
          <div className="dashboard-category-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {categories.map((category, index) => (
                    <Cell
                      key={category.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="dashboard-category-total">
              <strong>
                <AnimatedCount
                  value={totalLoans}
                  shouldReduceMotion={shouldReduceMotion}
                  locale={locale}
                />
              </strong>
              <span>{t("dashboard.total")}</span>
            </div>
          </div>

          <div className="dashboard-category-legend">
            {categories.map((category, index) => {
              const percentage =
                totalLoans > 0
                  ? Math.round((category.value / totalLoans) * 100)
                  : 0;

              return (
                <div
                  className="dashboard-category-legend-item"
                  key={category.name}
                >
                  <span
                    className="dashboard-category-legend-dot"
                    style={{
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                  <span className="dashboard-category-legend-name">
                    {category.name}
                  </span>
                  <span className="dashboard-category-legend-value">
                    <AnimatedCount
                      value={category.value}
                      shouldReduceMotion={shouldReduceMotion}
                      locale={locale}
                    />
                  </span>
                  <span className="dashboard-category-legend-percentage">
                    (
                    <AnimatedCount
                      value={percentage}
                      shouldReduceMotion={shouldReduceMotion}
                      locale={locale}
                    />
                    %)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default UserCategoryChart;
