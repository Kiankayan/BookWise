import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import { getMyLoans } from "../services/LoanService";
import type { Loan } from "../types/loan";
import { getLibraryItemImage } from "../utils/libraryItemImage";

function MyLoansPage() {
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

  return (
    <motion.div
      className="my-loans-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="page-intro">
        <p className="eyebrow">DIN LÅNEÖVERSIKT</p>
        <h2>Mina lån</h2>
        <p>Håll koll på dina lån och återlämningsdatum.</p>
      </section>

      {isLoading ? (
        <section className="page-panel">
          <p>Hämtar dina lån...</p>
        </section>
      ) : error ? (
        <section className="page-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <section className="dashboard-stats" aria-label="Lånestatistik">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <BookOpen size={22} />
              </div>
              <p className="dashboard-stat-label">Aktiva lån</p>
              <p className="dashboard-stat-value">{activeLoans.length}</p>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <CircleAlert size={22} />
              </div>
              <p className="dashboard-stat-label">Försenade lån</p>
              <p className="dashboard-stat-value">{overdueLoans.length}</p>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                <CircleCheck size={22} />
              </div>
              <p className="dashboard-stat-label">Återlämnade</p>
              <p className="dashboard-stat-value">{returnedLoans.length}</p>
            </article>
          </section>

          <section className="page-panel">
            <div className="page-panel-heading">
              <div>
                <h3>Aktiva lån</h3>
                <p>{activeLoans.length} aktiva lån</p>
              </div>
            </div>

            {activeLoans.length === 0 ? (
              <p>Du har inga aktiva lån just nu.</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {activeLoans.map((loan) => {
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
                            Lånad:{" "}
                            {new Date(loan.borrowDate).toLocaleDateString(
                              "sv-SE",
                            )}
                          </p>
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
                <h3>Lånehistorik</h3>
                <p>{returnedLoans.length} återlämnade lån</p>
              </div>
            </div>

            {returnedLoans.length === 0 ? (
              <p>Du har ingen tidigare lånehistorik.</p>
            ) : (
              <div className="dashboard-recent-loans-list">
                {returnedLoans.map((loan) => (
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
                          Lånad:{" "}
                          {new Date(loan.borrowDate).toLocaleDateString(
                            "sv-SE",
                          )}
                        </p>
                        <p>
                          Återlämnad:{" "}
                          {new Date(loan.returnedAt!).toLocaleDateString(
                            "sv-SE",
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="dashboard-recent-loan-status is-returned">
                      Återlämnad
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </motion.div>
  );
}

export default MyLoansPage;
