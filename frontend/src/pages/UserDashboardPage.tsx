import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck, ArrowRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

  const recentActiveLoans = activeLoans.slice(0, 3);
  const recentReturnedLoans = returnedLoans.slice(0, 3);

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

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>Mina aktiva lån</h3>
                <p>{activeLoans.length} aktiva lån</p>
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

            {recentActiveLoans.length === 0 ? (
              <p>Du har inga aktiva lån just nu.</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {recentActiveLoans.map((loan) => {
                  const isOverdue = new Date(loan.dueDate) < now;

                  return (
                    <article className="dashboard-recent-loan" key={loan.id}>
                      <div className="dashboard-recent-loan-details">
                        <img
                          className={`dashboard-recent-loan-cover ${
                            loan.item.imageUrl ? "" : "is-default-image"
                          }`}
                          src={getLibraryItemImage(loan.item)}
                          alt={`Omslag till ${loan.item.title}`}
                        />

                        <div className="dashboard-recent-loan-info">
                          <h4>{loan.item.title}</h4>
                          <p>
                            Återlämnas:{" "}
                            {new Date(loan.dueDate).toLocaleDateString("sv-SE")}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`dashboard-recent-loan-status ${
                          isOverdue ? "is-overdue" : "is-borrowed"
                        }`}
                      >
                        {isOverdue ? "Försenad" : "Aktiv"}
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
                <h3>Senaste återlämnade</h3>
                <p>{returnedLoans.length} återlämnade lån totalt</p>
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

            {recentReturnedLoans.length === 0 ? (
              <p>Du har inga återlämnade lån ännu.</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {recentReturnedLoans.map((loan) => (
                  <article className="dashboard-recent-loan" key={loan.id}>
                    <div className="dashboard-recent-loan-details">
                      <img
                        className={`dashboard-recent-loan-cover ${
                          loan.item.imageUrl ? "" : "is-default-image"
                        }`}
                        src={getLibraryItemImage(loan.item)}
                        alt={`Omslag till ${loan.item.title}`}
                      />

                      <div className="dashboard-recent-loan-info">
                        <h4>{loan.item.title}</h4>
                        <p>
                          Återlämnad:{" "}
                          {new Date(loan.returnedAt!).toLocaleDateString(
                            "sv-SE",
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="dashboard-recent-loan-status is-borrowed">
                      Återlämnad
                    </span>
                  </article>
                ))}
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
