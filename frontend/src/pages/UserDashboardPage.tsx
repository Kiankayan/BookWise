import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  CircleAlert,
  CircleCheck,
  ArrowRight,
  ChartNoAxesCombined,
  Tags,
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
import { useAuth } from "../context/AuthContext";
import { getMyLoans } from "../services/LoanService";
import type { Loan } from "../types/loan";
import { getLibraryItemImage } from "../utils/libraryItemImage";
import UserDashboardWelcome from "../components/user-dashboard/UserDashboardWelcome";
import UserDashboardStats from "../components/user-dashboard/UserDashboardStats";

type ChartPeriod = "week" | "month" | "sixMonths" | "year";

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

function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("sv") ? "sv-SE" : "en-US";

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

  useEffect(() => {
    async function loadMyLoans() {
      try {
        const response = await getMyLoans();
        setLoans(response.data);
        setError("");
      } catch (error) {
        console.error("Could not fetch user's loans.", error);
        setError(t("userDashboard.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadMyLoans();
  }, []);

  const now = new Date();

  const activeLoans = loans.filter((loan) => loan.returnedAt === null);

  const overdueLoans = activeLoans.filter(
    (loan) => new Date(loan.dueDate) < now,
  );

  const returnedLoans = loans.filter((loan) => loan.returnedAt !== null);

  const recentActivities = loans
    .flatMap((loan) => [
      {
        id: `${loan.id}-borrowed`,
        loan,
        type: "borrowed" as const,
        date: loan.borrowDate,
      },
      ...(loan.returnedAt
        ? [
            {
              id: `${loan.id}-returned`,
              loan,
              type: "returned" as const,
              date: loan.returnedAt,
            },
          ]
        : []),
    ])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const loanChartData = (() => {
    if (chartPeriod === "week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 6 + index,
        );

        const nextDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1,
        );

        const total = loans.filter((loan) => {
          const borrowDate = new Date(loan.borrowDate);
          return borrowDate >= date && borrowDate < nextDate;
        }).length;

        return {
          label: date.toLocaleDateString(locale, { weekday: "short" }),
          total,
        };
      });
    }

    if (chartPeriod === "month") {
      return Array.from({ length: 4 }, (_, index) => {
        const startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 27 + index * 7,
        );

        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + 7,
        );

        const total = loans.filter((loan) => {
          const borrowDate = new Date(loan.borrowDate);
          return borrowDate >= startDate && borrowDate < endDate;
        }).length;

        return {
          label: `${startDate.getDate()} ${startDate.toLocaleDateString(locale, { month: "short" })}`,
          total,
        };
      });
    }

    const numberOfMonths = chartPeriod === "sixMonths" ? 6 : 12;

    return Array.from({ length: numberOfMonths }, (_, index) => {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - (numberOfMonths - 1 - index),
        1,
      );

      const nextMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        1,
      );

      const total = loans.filter((loan) => {
        const borrowDate = new Date(loan.borrowDate);
        return borrowDate >= monthDate && borrowDate < nextMonth;
      }).length;

      return {
        label: monthDate.toLocaleDateString(locale, { month: "short" }),
        total,
      };
    });
  })();

  const categoryLoans = Object.values(
    loans.reduce<Record<string, { name: string; value: number }>>(
      (categories, loan) => {
        const categoryName = loan.item.category.name;

        if (!categories[categoryName]) {
          categories[categoryName] = {
            name: categoryName,
            value: 0,
          };
        }

        categories[categoryName].value += 1;

        return categories;
      },
      {},
    ),
  );

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

  const currentValues = {
    activeLoans: activeLoans.length,
    overdueLoans: overdueLoans.length,
    returnedLoans: returnedLoans.length,
  };

  type StatKey = keyof typeof currentValues;

  const stats: {
    key: StatKey;
    label: string;
    value: number;
    icon: typeof BookOpen;
    description: string;
  }[] = [
    {
      key: "activeLoans",
      label: t("userDashboard.activeLoans"),
      value: activeLoans.length,
      icon: BookOpen,
      description: t("userDashboard.activeLoansDescription"),
    },
    {
      key: "overdueLoans",
      label: t("userDashboard.overdueLoans"),
      value: overdueLoans.length,
      icon: CircleAlert,
      description: t("userDashboard.overdueLoansDescription"),
    },
    {
      key: "returnedLoans",
      label: t("userDashboard.returnedLoans"),
      value: returnedLoans.length,
      icon: CircleCheck,
      description: t("userDashboard.returnedLoansDescription"),
    },
  ];

  const [percentageChanges, setPercentageChanges] = useState<
    Record<StatKey, number>
  >({
    activeLoans: 0,
    overdueLoans: 0,
    returnedLoans: 0,
  });

  useEffect(() => {
    if (isLoading) return;

    const storageKey = `bookwise-user-dashboard-percentage-${user?.id}`;
    const storedData = localStorage.getItem(storageKey);

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

    localStorage.setItem(
      storageKey,
      JSON.stringify({ values: currentValues, changes }),
    );

    setPercentageChanges(changes);
  }, [
    isLoading,
    activeLoans.length,
    overdueLoans.length,
    returnedLoans.length,
  ]);

  if (isLoading) return null;

  return (
    <motion.div
      className="dashboard-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <UserDashboardWelcome
        name={user?.name ?? ""}
        shouldReduceMotion={shouldReduceMotion}
      />

      {error ? (
        <section className="page-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <UserDashboardStats
            stats={stats}
            percentageChanges={percentageChanges}
            shouldReduceMotion={shouldReduceMotion}
            locale={locale}
          />

          <section className="user-dashboard-charts">
            <section className="dashboard-chart-card">
              <div className="dashboard-chart-heading">
                <div className="dashboard-chart-icon" aria-hidden="true">
                  <ChartNoAxesCombined size={22} strokeWidth={1.8} />
                </div>

                <h3>{t("userDashboard.loansOverTime")}</h3>

                <select
                  className="dashboard-chart-period"
                  value={chartPeriod}
                  onChange={(event) =>
                    setChartPeriod(event.target.value as ChartPeriod)
                  }
                  aria-label={t("userDashboard.periodLabel")}
                >
                  <option value="week">{t("dashboard.lastWeek")}</option>
                  <option value="month">{t("dashboard.lastMonth")}</option>
                  <option value="sixMonths">
                    {t("dashboard.lastSixMonths")}
                  </option>
                  <option value="year">{t("dashboard.lastYear")}</option>
                </select>
              </div>

              <div className="dashboard-chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={loanChartData}
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
                      dataKey="total"
                      name={t("userDashboard.loanCount")}
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
                <h3>{t("userDashboard.loansByCategory")}</h3>
              </div>

              {categoryLoans.length === 0 ? (
                <p>{t("userDashboard.noLoans")}</p>
              ) : (
                <div className="dashboard-category-layout">
                  <div className="dashboard-category-chart-container">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={categoryLoans}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {categoryLoans.map((category, index) => (
                            <Cell
                              key={category.name}
                              fill={
                                categoryColors[index % categoryColors.length]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="dashboard-category-total">
                      <strong>
                        <AnimatedCount
                          value={loans.length}
                          shouldReduceMotion={shouldReduceMotion}
                          locale={locale}
                        />
                      </strong>
                      <span>{t("dashboard.total")}</span>
                    </div>
                  </div>

                  <div className="dashboard-category-legend">
                    {categoryLoans.map((category, index) => {
                      const percentage =
                        loans.length > 0
                          ? Math.round((category.value / loans.length) * 100)
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
          </section>

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>{t("userDashboard.recentActivity")}</h3>
                <p>{t("userDashboard.recentActivityDescription")}</p>
              </div>

              <button
                className="dashboard-recent-loans-view-all"
                type="button"
                onClick={() => navigate("/my-loans")}
              >
                {t("dashboard.viewAll")}
                <ArrowRight size={14} />
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p>{t("userDashboard.noActivity")}</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {recentActivities.map((activity) => {
                  const isReturned = activity.type === "returned";
                  const isOverdue =
                    !isReturned && new Date(activity.loan.dueDate) < now;

                  const status = isReturned
                    ? t("dashboard.returned")
                    : isOverdue
                      ? t("dashboard.overdueStatus")
                      : t("dashboard.borrowedStatus");

                  const statusClass = isReturned
                    ? "is-returned"
                    : isOverdue
                      ? "is-overdue"
                      : "is-borrowed";

                  return (
                    <article
                      className="dashboard-recent-loan"
                      key={activity.id}
                    >
                      <div className="dashboard-recent-loan-details">
                        <img
                          className={`dashboard-recent-loan-cover ${
                            activity.loan.item.imageUrl
                              ? ""
                              : "is-default-image"
                          }`}
                          src={getLibraryItemImage(activity.loan.item)}
                          alt={t("userDashboard.coverAlt", {
                            title: activity.loan.item.title,
                          })}
                        />

                        <div className="dashboard-recent-loan-info">
                          <h4>{activity.loan.item.title}</h4>
                          <p>
                            {isReturned
                              ? t("dashboard.returned")
                              : t("dashboard.borrowDate")}
                            :{" "}
                            {new Date(activity.date).toLocaleDateString(locale)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`dashboard-recent-loan-status ${statusClass}`}
                      >
                        {status}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dashboard-overview-card">
            <div className="dashboard-overview-content">
              <p className="eyebrow">{t("userDashboard.overviewEyebrow")}</p>
              <h3>{t("userDashboard.overviewTitle")}</h3>
              <p>
                {t("userDashboard.overviewDescription", {
                  loanCount: loans.length,
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
        </>
      )}
    </motion.div>
  );
}

export default UserDashboardPage;
