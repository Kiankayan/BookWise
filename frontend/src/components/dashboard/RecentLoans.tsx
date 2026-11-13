import { useTranslation } from "react-i18next";
import { Clock3, ArrowRight } from "lucide-react";
import type { LibraryItem } from "../../types/library";
import type { Loan } from "../../types/loan";
import { getLibraryItemImage } from "../../utils/libraryItemImage";

type RecentLoansProps = {
  recentLoans: Loan[];
  now: Date;
  locale: string;
  onViewAll: () => void;
};

function RecentLoans({
  recentLoans,
  now,
  locale,
  onViewAll,
}: RecentLoansProps) {
  const { t } = useTranslation();

  return (
    <section className="dashboard-recent-loans">
      <div className="dashboard-recent-loans-header">
        <div className="dashboard-recent-loans-title">
          <div className="dashboard-chart-icon" aria-hidden="true">
            <Clock3 size={20} strokeWidth={1.8} />
          </div>
          <h3>{t("dashboard.recentLoans")}</h3>
        </div>

        <button
          className="dashboard-recent-loans-view-all"
          type="button"
          onClick={onViewAll}
        >
          {t("dashboard.viewAll")}
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>

      {recentLoans.length === 0 ? (
        <p className="dashboard-recent-loans-empty">{t("dashboard.noLoans")}</p>
      ) : (
        <div className="dashboard-recent-loans-list">
          {recentLoans.map((loan) => {
            const isReturned = loan.returnedAt !== null;
            const isOverdue = !isReturned && new Date(loan.dueDate) < now;

            const statusClass = isReturned
              ? "is-returned"
              : isOverdue
                ? "is-overdue"
                : "is-borrowed";

            const statusLabel = isReturned
              ? t("dashboard.returned")
              : isOverdue
                ? t("dashboard.overdueStatus")
                : t("dashboard.borrowedStatus");

            return (
              <article className="dashboard-recent-loan" key={loan.id}>
                <div className="dashboard-recent-loan-details">
                  <img
                    className={`dashboard-recent-loan-cover ${
                      loan.item.imageUrl ? "" : "is-default-image"
                    }`}
                    src={getLibraryItemImage(loan.item as LibraryItem)}
                    alt={`Omslag till ${loan.item.title}`}
                  />

                  <div className="dashboard-recent-loan-info">
                    <h4>{loan.item.title}</h4>
                    <p>
                      {t("dashboard.borrower")}: {loan.borrowerName}
                    </p>
                    <p>
                      {t("dashboard.borrowDate")}:{" "}
                      {new Date(loan.borrowDate).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>

                <span className={`dashboard-recent-loan-status ${statusClass}`}>
                  {statusLabel}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecentLoans;
