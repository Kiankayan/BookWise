import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category, LibraryItem } from "../types/library";
import { getLibraryItemImage } from "../utils/libraryItemImage";
import {
  BookOpen,
  Tags,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  ChartNoAxesCombined,
  TrendingUp,
  TrendingDown,
  Clock3,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAvailabilityHistory,
  type ChartPeriod,
} from "../utils/dashboardChartData";
import { motion, useReducedMotion } from "motion/react";

type DashboardPageProps = {
  libraryItems: LibraryItem[];
  categories: Category[];
};

function AnimatedPercentage({
  value,
  shouldReduceMotion,
}: {
  value: number;
  shouldReduceMotion: boolean | null;
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
      {displayValue.toLocaleString("sv-SE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })}
      %
    </>
  );
}

function AnimatedCount({
  value,
  shouldReduceMotion,
}: {
  value: number;
  shouldReduceMotion: boolean | null;
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

  return <>{displayValue.toLocaleString("sv-SE")}</>;
}

function DashboardPage({ libraryItems, categories }: DashboardPageProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const borrowedItems = libraryItems.filter(
    (item) => item.borrower !== null,
  ).length;

  const availableItems = libraryItems.length - borrowedItems;

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

  const availabilityData = getAvailabilityHistory(chartPeriod);

  const categoryData = categories.map((category) => ({
    name: category.name,
    antal: libraryItems.filter((item) => item.categoryId === category.id)
      .length,
  }));

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

  const now = new Date();

  const overdueItems = libraryItems.filter(
    (item) =>
      item.borrower !== null &&
      item.dueDate !== null &&
      new Date(item.dueDate) < now,
  ).length;

  const recentLoans = libraryItems
    .filter((item) => item.borrower !== null && item.borrowDate !== null)
    .sort(
      (a, b) =>
        new Date(b.borrowDate!).getTime() - new Date(a.borrowDate!).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      key: "totalItems",
      label: "Totalt material",
      value: libraryItems.length,
      icon: BookOpen,
      description: "Bibliotekets samlade material",
    },
    {
      key: "categories",
      label: "Kategorier",
      value: categories.length,
      icon: Tags,
      description: "Organiserade kategorier",
    },
    {
      key: "borrowed",
      label: "Utlånade",
      value: borrowedItems,
      icon: ArrowUpRight,
      description: "Material som är utlånat",
    },
    {
      key: "available",
      label: "Tillgängliga",
      value: availableItems,
      icon: CircleCheck,
      description: "Material som inte är utlånat",
    },
    {
      key: "overdue",
      label: "Försenade lån",
      value: overdueItems,
      icon: CircleAlert,
      description: "Material med passerat återlämningsdatum",
    },
  ];

  const currentValues = {
    totalItems: libraryItems.length,
    categories: categories.length,
    borrowed: borrowedItems,
    available: availableItems,
    overdue: overdueItems,
  };

  type StatKey = keyof typeof currentValues;

  const [percentageChanges, setPercentageChanges] = useState<
    Record<StatKey, number>
  >({
    totalItems: 0,
    categories: 0,
    borrowed: 0,
    available: 0,
    overdue: 0,
  });

  useEffect(() => {
    const storageKey = "bookwise-dashboard-percentage";
    const storedData = sessionStorage.getItem(storageKey);

    type StoredData = {
      values: typeof currentValues;
      changes: Record<StatKey, number>;
    };

    const stored = storedData ? (JSON.parse(storedData) as StoredData) : null;

    const keys = Object.keys(currentValues) as StatKey[];

    const sameValues =
      stored !== null &&
      keys.every((key) => stored.values[key] === currentValues[key]);

    if (sameValues && stored) {
      setPercentageChanges(stored.changes);
      return;
    }

    const changes = {} as Record<StatKey, number>;

    keys.forEach((key) => {
      const oldValue = stored?.values[key];
      const newValue = currentValues[key];

      if (oldValue === undefined || oldValue === newValue) {
        changes[key] = 0;
        return;
      }

      changes[key] =
        oldValue === 0
          ? newValue > 0
            ? 100
            : -100
          : Number(
              (((newValue - oldValue) / Math.abs(oldValue)) * 100).toFixed(1),
            );
    });

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ values: currentValues, changes }),
    );

    setPercentageChanges(changes);
  }, [
    libraryItems.length,
    categories.length,
    borrowedItems,
    availableItems,
    overdueItems,
  ]);

  const illustrationTransition = {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      className="dashboard-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <p className="eyebrow">DIN BIBLIOTEKSÖVERSIKT</p>
          <h2>Välkommen tillbaka!</h2>
          <p>
            Här får du en snabb överblick över biblioteket och dess material.
          </p>
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

      <section className="dashboard-stats" aria-label="Biblioteksstatistik">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const percentage = percentageChanges[stat.key as StatKey];

          return (
            <article className="dashboard-stat-card" key={stat.label}>
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
                        key={stat.key}
                        value={percentage}
                        shouldReduceMotion={shouldReduceMotion}
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

      <div className="dashboard-panels">
        <section className="dashboard-chart-card">
          <div className="dashboard-chart-heading">
            <div className="dashboard-chart-icon" aria-hidden="true">
              <ChartNoAxesCombined size={22} strokeWidth={1.8} />
            </div>

            <h3>Utlånade vs tillgängliga</h3>

            <select
              className="dashboard-chart-period"
              value={chartPeriod}
              onChange={(event) =>
                setChartPeriod(event.target.value as ChartPeriod)
              }
              aria-label="Välj tidsperiod för biblioteksstatistik"
            >
              <option value="week">Senaste veckan</option>
              <option value="month">Senaste månaden</option>
              <option value="sixMonths">Senaste 6 månaderna</option>
              <option value="year">Senaste året</option>
            </select>
          </div>

          <div className="dashboard-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={availabilityData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="22%"
                barGap={4}
              >
                <CartesianGrid
                  stroke="#eeeaf7"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#807990", fontSize: 12 }}
                  dy={8}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#807990", fontSize: 12 }}
                  width={34}
                />

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
                />

                <Bar
                  dataKey="available"
                  name="Tillgängliga"
                  fill="#c9b8fa"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

                <Bar
                  dataKey="borrowed"
                  name="Utlånade"
                  fill="#7138df"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-category-card">
          <div className="dashboard-category-heading">
            <div className="dashboard-chart-icon" aria-hidden="true">
              <Tags size={20} strokeWidth={1.8} />
            </div>
            <h3>Material per kategori</h3>
          </div>

          {categoryData.length === 0 ? (
            <p>Det finns inga kategorier att visa.</p>
          ) : (
            <div className="dashboard-category-layout">
              <div className="dashboard-category-chart-container">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="antal"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={43}
                      outerRadius={68}
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
                      value={libraryItems.length}
                      shouldReduceMotion={shouldReduceMotion}
                    />
                  </strong>
                  <span>Totalt</span>
                </div>
              </div>

              <div className="dashboard-category-legend">
                {categoryData.map((category, index) => {
                  const percentage =
                    libraryItems.length > 0
                      ? Math.round((category.antal / libraryItems.length) * 100)
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
                        />
                      </span>
                      <span className="dashboard-category-legend-percentage">
                        (
                        <AnimatedCount
                          value={percentage}
                          shouldReduceMotion={shouldReduceMotion}
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

        <section className="dashboard-recent-loans">
          <div className="dashboard-recent-loans-header">
            <div className="dashboard-recent-loans-title">
              <div className="dashboard-chart-icon" aria-hidden="true">
                <Clock3 size={20} strokeWidth={1.8} />
              </div>
              <h3>Senaste utlånen</h3>
            </div>

            <button
              className="dashboard-recent-loans-view-all"
              type="button"
              onClick={() => navigate("/library")}
            >
              Visa alla
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          {recentLoans.length === 0 ? (
            <p className="dashboard-recent-loans-empty">
              Det finns inga aktiva lån att visa.
            </p>
          ) : (
            <div className="dashboard-recent-loans-list">
              {recentLoans.map((item) => {
                const isOverdue =
                  item.dueDate !== null && new Date(item.dueDate) < now;

                return (
                  <article className="dashboard-recent-loan" key={item.id}>
                    <div className="dashboard-recent-loan-details">
                      <img
                        className={`dashboard-recent-loan-cover ${
                          item.imageUrl ? "" : "is-default-image"
                        }`}
                        src={getLibraryItemImage(item)}
                        alt={`Omslag till ${item.title}`}
                      />

                      <div className="dashboard-recent-loan-info">
                        <h4>{item.title}</h4>
                        <p>Låntagare: {item.borrower}</p>
                        <p>
                          Utlånad:{" "}
                          {new Date(item.borrowDate!).toLocaleDateString(
                            "sv-SE",
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`dashboard-recent-loan-status ${
                        isOverdue ? "is-overdue" : "is-borrowed"
                      }`}
                    >
                      {isOverdue ? "Försenad" : "Utlånad"}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-overview-card">
        <div className="dashboard-overview-content">
          <p className="eyebrow">SNABBÖVERSIKT</p>
          <h3>Ditt bibliotek på ett ställe</h3>
          <p>
            Du har {libraryItems.length} biblioteksposter fördelade över{" "}
            {categories.length} kategorier.
          </p>

          <button
            className="dashboard-library-button"
            type="button"
            onClick={() => navigate("/library")}
          >
            Utforska biblioteket
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
            ...illustrationTransition,
            duration: 6,
            delay: 0.5,
          }}
        />
      </section>
    </motion.div>
  );
}

export default DashboardPage;
