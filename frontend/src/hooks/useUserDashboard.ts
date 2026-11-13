import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getMyLoans } from "../services/LoanService";
import {
  getUserLoanChartData,
  getUserDashboardPercentageChanges,
  type UserDashboardPercentageChanges,
  type UserDashboardStatValues,
} from "../utils/userDashboardUtils";
import type { Loan } from "../types/loan";
import type { ChartPeriod } from "../components/user-dashboard/UserLoanChart";

type Activity = {
  id: string;
  loan: Loan;
  type: "borrowed" | "returned";
  date: string;
};

type CategoryLoan = {
  name: string;
  value: number;
};

const categoryColors = [
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#14b8a6",
  "#a1a1aa",
  "#6366f1",
  "#f97316",
];

function useUserDashboard(chartPeriod: ChartPeriod) {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("sv") ? "sv-SE" : "en-US";

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
        console.error("Could not fetch user's loans.", error);
        setError(t("userDashboard.loadError"));
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

  const recentActivities: Activity[] = loans
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

  const loanChartData = getUserLoanChartData(loans, chartPeriod, now, locale);

  const categoryLoans: CategoryLoan[] = Object.values(
    loans.reduce<Record<string, CategoryLoan>>((categories, loan) => {
      const categoryName = loan.item.category.name;

      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          value: 0,
        };
      }

      categories[categoryName].value += 1;

      return categories;
    }, {}),
  );

  const currentValues: UserDashboardStatValues = {
    activeLoans: activeLoans.length,
    overdueLoans: overdueLoans.length,
    returnedLoans: returnedLoans.length,
  };

  const [percentageChanges, setPercentageChanges] =
    useState<UserDashboardPercentageChanges>({
      activeLoans: 0,
      overdueLoans: 0,
      returnedLoans: 0,
    });

  useEffect(() => {
    if (isLoading) return;

    const storageKey = `bookwise-user-dashboard-percentage-${user?.id}`;
    const storedData = localStorage.getItem(storageKey);

    type StoredData = {
      values: UserDashboardStatValues;
      changes: UserDashboardPercentageChanges;
    };

    const stored = storedData ? (JSON.parse(storedData) as StoredData) : null;

    const keys: (keyof UserDashboardStatValues)[] = [
      "activeLoans",
      "overdueLoans",
      "returnedLoans",
    ];

    const sameValues =
      stored !== null &&
      keys.every((key) => stored.values[key] === currentValues[key]);

    if (sameValues && stored) {
      setPercentageChanges(stored.changes);
      return;
    }

    const changes = getUserDashboardPercentageChanges(
      currentValues,
      stored?.values,
    );

    localStorage.setItem(
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

  return {
    user,
    locale,
    loans,
    isLoading,
    error,
    now,
    activeLoans,
    overdueLoans,
    returnedLoans,
    recentActivities,
    loanChartData,
    categoryLoans,
    categoryColors,
    percentageChanges,
  };
}

export default useUserDashboard;
