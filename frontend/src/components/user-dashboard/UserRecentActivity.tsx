import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import type { Loan } from "../../types/loan";
import { getLibraryItemImage } from "../../utils/libraryItemImage";

type Activity = {
  id: string;
  loan: Loan;
  type: "borrowed" | "returned";
  date: string;
};

type UserRecentActivityProps = {
  activities: Activity[];
  now: Date;
  locale: string;
  onViewAll: () => void;
};

function UserRecentActivity({
  activities,
  now,
  locale,
  onViewAll,
}: UserRecentActivityProps) {
  const { t } = useTranslation();

  return (
    <section className="page-panel">
      <div className="page-panel-heading">
        <div>
          <h3>{t("userDashboard.recentActivity")}</h3>
          <p>{t("userDashboard.recentActivityDescription")}</p>
        </div>

        <button
          className="dashboard-recent-loans-view-all"
          type="button"
          onClick={onViewAll}
        >
          {t("dashboard.viewAll")}
          <ArrowRight size={14} />
        </button>
      </div>

      {activities.length === 0 ? (
        <p>{t("userDashboard.noActivity")}</p>
      ) : (
        <div className="dashboard-recent-loans-list">
          {activities.map((activity) => {
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
              <article className="dashboard-recent-loan" key={activity.id}>
                <div className="dashboard-recent-loan-details">
                  <img
                    className={`dashboard-recent-loan-cover ${
                      activity.loan.item.imageUrl ? "" : "is-default-image"
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
                      : {new Date(activity.date).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>

                <span className={`dashboard-recent-loan-status ${statusClass}`}>
                  {status}
                </span>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default UserRecentActivity;
