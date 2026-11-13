import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import type { Loan } from "../../types/loan";
import { getLibraryItemImage } from "../../utils/libraryItemImage";

type MyLoanItemProps = {
  loan: Loan;
  type: "active" | "returned";
  index: number;
};

function MyLoanItem({ loan, type, index }: MyLoanItemProps) {
  const { t, i18n } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  const dateLocale = i18n.resolvedLanguage?.startsWith("en")
    ? "en-GB"
    : "sv-SE";

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString(dateLocale);

  const isOverdue = type === "active" && new Date(loan.dueDate) < new Date();

  return (
    <motion.article
      className="my-loans-item"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: shouldReduceMotion
          ? 0
          : (type === "active" ? 0.3 : 0.45) + index * 0.08,
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
            {t("myLoansPage.borrowedDate")}: {formatDate(loan.borrowDate)}
          </p>
          <p>
            {t(
              type === "active"
                ? "myLoansPage.dueDate"
                : "myLoansPage.returnedDate",
            )}
            : {formatDate(type === "active" ? loan.dueDate : loan.returnedAt!)}
          </p>
        </div>
      </div>

      <span
        className={`my-loans-item-status ${
          type === "returned"
            ? "is-returned"
            : isOverdue
              ? "is-overdue"
              : "is-borrowed"
        }`}
      >
        {type === "returned"
          ? t("myLoansPage.returned")
          : isOverdue
            ? t("myLoansPage.overdue")
            : t("myLoansPage.active")}
      </span>
    </motion.article>
  );
}

export default MyLoanItem;
