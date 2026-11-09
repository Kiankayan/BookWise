import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMyLoans } from "../services/LoanService";
import type { Loan } from "../types/loan";
import { getLibraryItemImage } from "../utils/libraryItemImage";

function MyLoansPage() {
  const { t, i18n } = useTranslation();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const dateLocale = i18n.resolvedLanguage?.startsWith("en")
    ? "en-GB"
    : "sv-SE";

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(dateLocale);

  useEffect(() => {
    async function loadMyLoans() {
      try {
        const response = await getMyLoans();
        setLoans(response.data);
        setHasError(false);
      } catch (error) {
        console.error("Failed to fetch user loans.", error);
        setHasError(true);
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
        <p className="eyebrow">{t("myLoansPage.eyebrow")}</p>
        <h2>{t("myLoansPage.title")}</h2>
        <p>{t("myLoansPage.description")}</p>
      </section>

      {hasError ? (
        <section className="my-loans-panel">
          <p role="alert">{t("myLoansPage.loadError")}</p>
        </section>
      ) : (
        <>
          <section
            className="my-loans-stats"
            aria-label={t("myLoansPage.statisticsLabel")}
          >
            {[
              {
                label: t("myLoansPage.activeLoans"),
                value: activeLoans.length,
                icon: BookOpen,
              },
              {
                label: t("myLoansPage.overdueLoans"),
                value: overdueLoans.length,
                icon: CircleAlert,
              },
              {
                label: t("myLoansPage.returnedLoans"),
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
                <h3>{t("myLoansPage.activeLoans")}</h3>
                <p>
                  {t("myLoansPage.activeLoansCount", {
                    count: activeLoans.length,
                  })}
                </p>
              </div>
            </div>

            {activeLoans.length === 0 ? (
              <p>{t("myLoansPage.noActiveLoans")}</p>
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
                          alt={t("myLoansPage.coverAlt", {
                            title: loan.item.title,
                          })}
                        />

                        <div className="my-loans-item-info">
                          <h4>{loan.item.title}</h4>
                          <p>
                            {t("myLoansPage.borrowedDate")}:{" "}
                            {formatDate(loan.borrowDate)}
                          </p>
                          <p>
                            {t("myLoansPage.dueDate")}:{" "}
                            {formatDate(loan.dueDate)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`my-loans-item-status ${
                          isOverdue ? "is-overdue" : "is-borrowed"
                        }`}
                      >
                        {isOverdue
                          ? t("myLoansPage.overdue")
                          : t("myLoansPage.active")}
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
                <h3>{t("myLoansPage.loanHistory")}</h3>
                <p>
                  {t("myLoansPage.returnedLoansCount", {
                    count: returnedLoans.length,
                  })}
                </p>
              </div>
            </div>

            {returnedLoans.length === 0 ? (
              <p>{t("myLoansPage.noLoanHistory")}</p>
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
                        alt={t("myLoansPage.coverAlt", {
                          title: loan.item.title,
                        })}
                      />

                      <div className="my-loans-item-info">
                        <h4>{loan.item.title}</h4>
                        <p>
                          {t("myLoansPage.borrowedDate")}:{" "}
                          {formatDate(loan.borrowDate)}
                        </p>
                        <p>
                          {t("myLoansPage.returnedDate")}:{" "}
                          {formatDate(loan.returnedAt!)}
                        </p>
                      </div>
                    </div>

                    <span className="my-loans-item-status is-returned">
                      {t("myLoansPage.returned")}
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
