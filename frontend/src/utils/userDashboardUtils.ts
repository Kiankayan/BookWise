import type { ChartPeriod } from "../components/user-dashboard/UserLoanChart";
import type { Loan } from "../types/loan";

type LoanChartData = {
  label: string;
  total: number;
};

export type UserDashboardStatKey =
  | "activeLoans"
  | "overdueLoans"
  | "returnedLoans";

export type UserDashboardStatValues = Record<UserDashboardStatKey, number>;

export type UserDashboardPercentageChanges = Record<
  UserDashboardStatKey,
  number
>;

export function getUserLoanChartData(
  loans: Loan[],
  chartPeriod: ChartPeriod,
  now: Date,
  locale: string,
): LoanChartData[] {
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
}

export function getUserDashboardPercentageChanges(
  currentValues: UserDashboardStatValues,
  previousValues?: UserDashboardStatValues,
): UserDashboardPercentageChanges {
  const keys: UserDashboardStatKey[] = [
    "activeLoans",
    "overdueLoans",
    "returnedLoans",
  ];

  const changes = {} as UserDashboardPercentageChanges;

  keys.forEach((key) => {
    const oldValue = previousValues?.[key];
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

  return changes;
}
