import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  CircleAlert,
  CircleCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ChartNoAxesCombined,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyLoans() {
      try {
        const response = await getMyLoans();
        setLoans(response.data);
        setError("");
      } catch (error) {
        console.error("Kunde inte hämta användarens lån.", error);
        setError("Kunde inte hämta dina lån. Försök igen senare.");
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

  const monthlyLoans = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1,
    );

    const monthKey = `${monthDate.getFullYear()}-${String(
      monthDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    const total = loans.filter((loan) => {
      const borrowDate = new Date(loan.borrowDate);
      const loanMonthKey = `${borrowDate.getFullYear()}-${String(
        borrowDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      return loanMonthKey === monthKey;
    }).length;

    return {
      month: monthDate.toLocaleDateString("sv-SE", { month: "short" }),
      total,
    };
  });

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
    "#7656c9",
    "#9b7de0",
    "#b8a2ed",
    "#d1c3f5",
    "#6040ad",
    "#e0d7f8",
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
      label: "Aktiva lån",
      value: activeLoans.length,
      icon: BookOpen,
      description: "Dina pågående lån",
    },
    {
      key: "overdueLoans",
      label: "Försenade lån",
      value: overdueLoans.length,
      icon: CircleAlert,
      description: "Lån som passerat återlämningsdatum",
    },
    {
      key: "returnedLoans",
      label: "Återlämnade",
      value: returnedLoans.length,
      icon: CircleCheck,
      description: "Böcker du har återlämnat",
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

    const storageKey = "bookwise-user-dashboard-percentage";
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
    isLoading,
    activeLoans.length,
    overdueLoans.length,
    returnedLoans.length,
  ]);

  return (
    <motion.div
      className="dashboard-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <p className="eyebrow">DIN PERSONLIGA ÖVERSIKT</p>
          <h2>Välkommen tillbaka, {user?.name}!</h2>
          <p>Här kan du följa dina lån och hålla koll på dina böcker.</p>
        </div>

        <div className="dashboard-book-illustration">
          <motion.img
            className="dashboard-welcome-illustration"
            src="/images/dashboard-open-book.png"
            alt=""
            aria-hidden="true"
            animate={{
              y: [0, -6, 0],
              rotate: [0, 0.5, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.img
            className="dashboard-book-page-test"
            src="/images/book-page-test.png"
            alt=""
            aria-hidden="true"
            style={{ transformOrigin: "bottom center" }}
            animate={{ rotate: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </section>

      {isLoading ? (
        <section className="page-panel">
          <p>Hämtar din låneöversikt...</p>
        </section>
      ) : error ? (
        <section className="page-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <section
            className="dashboard-stats user-dashboard-stats"
            aria-label="Din lånestatistik"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const percentage = percentageChanges[stat.key];

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
                    <p className="dashboard-stat-description">
                      {stat.description}
                    </p>
                  </motion.div>
                </article>
              );
            })}
          </section>

          <section className="dashboard-chart-card">
            <div className="dashboard-chart-heading">
              <div>
                <h3>Mina lån över tid</h3>
                <p>Antal lån under de senaste sex månaderna</p>
              </div>
            </div>

            <div className="dashboard-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyLoans}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    name="Antal lån"
                    fill="#7656c9"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="dashboard-chart-card">
            <div className="dashboard-chart-heading">
              <div>
                <h3>Mina lån per kategori</h3>
                <p>Fördelning av alla dina lån</p>
              </div>
            </div>

            {categoryLoans.length === 0 ? (
              <p>Du har inga lån att visa ännu.</p>
            ) : (
              <div className="dashboard-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryLoans}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {categoryLoans.map((category, index) => (
                        <Cell
                          key={category.name}
                          fill={categoryColors[index % categoryColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>Senaste aktivitet</h3>
                <p>Dina fem senaste lånehändelser</p>
              </div>

              <button
                className="dashboard-recent-loans-view-all"
                type="button"
                onClick={() => navigate("/my-loans")}
              >
                Visa alla
                <ArrowRight size={14} />
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p>Du har ingen låneaktivitet ännu.</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {recentActivities.map((activity) => {
                  const isReturned = activity.type === "returned";
                  const isOverdue =
                    !isReturned && new Date(activity.loan.dueDate) < now;

                  const status = isReturned
                    ? "Återlämnad"
                    : isOverdue
                      ? "Försenad"
                      : "Utlånad";

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
                          alt={`Omslag till ${activity.loan.item.title}`}
                        />

                        <div className="dashboard-recent-loan-info">
                          <h4>{activity.loan.item.title}</h4>
                          <p>
                            {isReturned ? "Återlämnad:" : "Utlånad:"}{" "}
                            {new Date(activity.date).toLocaleDateString(
                              "sv-SE",
                            )}
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

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>Utforska biblioteket</h3>
                <p>Hitta nästa bok att läsa.</p>
              </div>

              <button
                className="dashboard-library-button"
                type="button"
                onClick={() => navigate("/library")}
              >
                Till biblioteket
                <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}

export default UserDashboardPage;
