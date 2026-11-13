import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

type CategoryData = {
  name: string;
  antal: number;
};

type CategoryChartProps = {
  categoryData: CategoryData[];
  totalItems: number;
  shouldReduceMotion: boolean | null;
  locale: string;
};

const categoryColors = [
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
  "#a1a1aa",
  "#6366f1",
  "#f97316",
];

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

function CategoryChart({
  categoryData,
  totalItems,
  shouldReduceMotion,
  locale,
}: CategoryChartProps) {
  const { t } = useTranslation();

  return (
    <section className="dashboard-category-card">
      <div className="dashboard-category-heading">
        <div className="dashboard-chart-icon" aria-hidden="true">
          <Tags size={20} strokeWidth={1.8} />
        </div>
        <h3>{t("dashboard.categoryChart")}</h3>
      </div>

      {categoryData.length === 0 ? (
        <p>{t("dashboard.noCategories")}</p>
      ) : (
        <div className="dashboard-category-layout">
          <div className="dashboard-category-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="antal"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={categoryColors[index % categoryColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="dashboard-category-total">
              <strong>
                <AnimatedCount
                  value={totalItems}
                  shouldReduceMotion={shouldReduceMotion}
                  locale={locale}
                />
              </strong>
              <span>{t("dashboard.total")}</span>
            </div>
          </div>

          <div className="dashboard-category-legend">
            {categoryData.map((category, index) => {
              const percentage =
                totalItems > 0
                  ? Math.round((category.antal / totalItems) * 100)
                  : 0;

              return (
                <div
                  className="dashboard-category-legend-item"
                  key={category.name}
                >
                  <span
                    className="dashboard-category-legend-dot"
                    style={{
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                    }}
                  />
                  <span className="dashboard-category-legend-name">
                    {category.name}
                  </span>
                  <span className="dashboard-category-legend-value">
                    <AnimatedCount
                      value={category.antal}
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

export default CategoryChart;
