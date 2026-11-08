import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import { getMyLoans } from "../services/LoanService";
import type { Loan } from "../types/loan";
import { getLibraryItemImage } from "../utils/libraryItemImage";

function MyLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const shouldReduceMotion = useReducedMotion();

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

  if (isLoading) return null;

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

      {error ? (
        <section className="my-loans-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <section className="my-loans-stats" aria-label="Lånestatistik">
            {[
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
            ].map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.article
                  className="my-loans-stat-card"
                  key={stat.label}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5, scale: 1.015 }}
                  transition={{
                    duration: 0.25,
                    delay: shouldReduceMotion
                      ? 0
                      : Math.min(index * 0.08, 0.48),
                    ease: "easeOut",
                  }}
                >
                  <div className="my-loans-stat-icon">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <p className="my-loans-stat-label">{stat.label}</p>
                  <p className="my-loans-stat-value">{stat.value}</p>
                </motion.article>
              );
            })}
          </section>

          <motion.section
            className="my-loans-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: shouldReduceMotion ? 0 : 0.25,
              ease: "easeOut",
            }}
          >
            <div className="my-loans-panel-heading">
              <div>
                <h3>Aktiva lån</h3>
                <p>{activeLoans.length} aktiva lån</p>
              </div>
            </div>

            {activeLoans.length === 0 ? (
              <p>Du har inga aktiva lån just nu.</p>
            ) : (
              <div className="my-loans-list">
                {activeLoans.map((loan, index) => {
                  const isOverdue = new Date(loan.dueDate) < now;

                  return (
                    <motion.article
                      className="my-loans-item"
                      key={loan.id}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.25,
                        delay: shouldReduceMotion ? 0 : 0.3 + index * 0.08,
                        ease: "easeOut",
                      }}
                    >
                      <div className="my-loans-item-details">
                        <img
                          className={`my-loans-item-cover ${
                            loan.item.imageUrl ? "" : "is-default-image"
                          }`}
                          src={getLibraryItemImage(loan.item)}
                          alt={`Omslag till ${loan.item.title}`}
                        />

                        <div className="my-loans-item-info">
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
                        className={`my-loans-item-status ${
                          isOverdue ? "is-overdue" : "is-borrowed"
                        }`}
                      >
                        {isOverdue ? "Försenad" : "Aktiv"}
                      </span>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </motion.section>

          <motion.section
            className="my-loans-panel"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: shouldReduceMotion ? 0 : 0.4,
              ease: "easeOut",
            }}
          >
            <div className="my-loans-panel-heading">
              <div>
                <h3>Lånehistorik</h3>
                <p>{returnedLoans.length} återlämnade lån</p>
              </div>
            </div>

            {returnedLoans.length === 0 ? (
              <p>Du har ingen tidigare lånehistorik.</p>
            ) : (
              <div className="my-loans-list">
                {returnedLoans.map((loan, index) => (
                  <motion.article
                    className="my-loans-item"
                    key={loan.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: shouldReduceMotion ? 0 : 0.45 + index * 0.08,
                      ease: "easeOut",
                    }}
                  >
                    <div className="my-loans-item-details">
                      <img
                        className={`my-loans-item-cover ${
                          loan.item.imageUrl ? "" : "is-default-image"
                        }`}
                        src={getLibraryItemImage(loan.item)}
                        alt={`Omslag till ${loan.item.title}`}
                      />

                      <div className="my-loans-item-info">
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

                    <span className="my-loans-item-status is-returned">
                      Återlämnad
                    </span>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>
        </>
      )}
    </motion.div>
  );
}

export default MyLoansPage;
