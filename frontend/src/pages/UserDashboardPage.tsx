import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck, ArrowRight } from "lucide-react";
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

function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const stats = [
    {
      label: "Aktiva lån",
      value: activeLoans.length,
      icon: BookOpen,
    },
    {
      label: "Försenade lån",
      value: overdueLoans.length,
      icon: CircleAlert,
    },
    {
      label: "Återlämnade",
      value: returnedLoans.length,
      icon: CircleCheck,
    },
  ];

  return (
    <motion.div
      className="dashboard-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">DIN PERSONLIGA ÖVERSIKT</p>
        <h2>Välkommen tillbaka, {user?.name}!</h2>
        <p>Här kan du följa dina lån och hålla koll på dina böcker.</p>
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
          <section className="dashboard-stats" aria-label="Din lånestatistik">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="dashboard-stat-card" key={stat.label}>
                  <div className="dashboard-stat-icon">
                    <Icon size={22} />
                  </div>
                  <p className="dashboard-stat-label">{stat.label}</p>
                  <p className="dashboard-stat-value">{stat.value}</p>
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
