import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyLoans } from "../services/LoanService";
import type { Loan } from "../types/loan";
import UserDashboardWelcome from "../components/user-dashboard/UserDashboardWelcome";
import UserDashboardStats from "../components/user-dashboard/UserDashboardStats";
import UserLoanChart, {
  type ChartPeriod,
} from "../components/user-dashboard/UserLoanChart";
import UserCategoryChart from "../components/user-dashboard/UserCategoryChart";
import UserRecentActivity from "../components/user-dashboard/UserRecentActivity";
import UserDashboardOverview from "../components/user-dashboard/UserDashboardOverview";

function UserDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("sv") ? "sv-SE" : "en-US";

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

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

  const loanChartData = (() => {
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
  })();

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
    "#8b5cf6",
    "#3b82f6",
    "#ec4899",
    "#f59e0b",
    "#14b8a6",
    "#a1a1aa",
    "#6366f1",
    "#f97316",
  ];

  const currentValues = {
    activeLoans: activeLoans.length,
    overdueLoans: overdueLoans.length,
    returnedLoans: returnedLoans.length,
  };

  type StatKey = keyof typeof currentValues;

  const stats: {
    key: StatKey;
    label: string;
    value: number;
    icon: typeof BookOpen;
    description: string;
  }[] = [
    {
      key: "activeLoans",
      label: t("userDashboard.activeLoans"),
      value: activeLoans.length,
      icon: BookOpen,
      description: t("userDashboard.activeLoansDescription"),
    },
    {
      key: "overdueLoans",
      label: t("userDashboard.overdueLoans"),
      value: overdueLoans.length,
      icon: CircleAlert,
      description: t("userDashboard.overdueLoansDescription"),
    },
    {
      key: "returnedLoans",
      label: t("userDashboard.returnedLoans"),
      value: returnedLoans.length,
      icon: CircleCheck,
      description: t("userDashboard.returnedLoansDescription"),
    },
  ];

  const [percentageChanges, setPercentageChanges] = useState<
    Record<StatKey, number>
  >({
    activeLoans: 0,
    overdueLoans: 0,
    returnedLoans: 0,
  });

  useEffect(() => {
    if (isLoading) return;

    const storageKey = `bookwise-user-dashboard-percentage-${user?.id}`;
    const storedData = localStorage.getItem(storageKey);

    type StoredData = {
      values: typeof currentValues;
      changes: Record<StatKey, number>;
    };

    const stored = storedData ? (JSON.parse(storedData) as StoredData) : null;

    const keys = Object.keys(currentValues) as StatKey[];

    const sameValues =
      stored !== null &&
      keys.every((key) => stored.values[key] === currentValues[key]);

    if (sameValues && stored) {
      setPercentageChanges(stored.changes);
      return;
    }

    const changes = {} as Record<StatKey, number>;

    keys.forEach((key) => {
      const oldValue = stored?.values[key];
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

  if (isLoading) return null;

  return (
    <motion.div
      className="dashboard-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <UserDashboardWelcome
        name={user?.name ?? ""}
        shouldReduceMotion={shouldReduceMotion}
      />

      {error ? (
        <section className="page-panel">
          <p role="alert">{error}</p>
        </section>
      ) : (
        <>
          <UserDashboardStats
            stats={stats}
            percentageChanges={percentageChanges}
            shouldReduceMotion={shouldReduceMotion}
            locale={locale}
          />

          <section className="user-dashboard-charts">
            <UserLoanChart
              data={loanChartData}
              chartPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
            />

            <UserCategoryChart
              categories={categoryLoans}
              colors={categoryColors}
              totalLoans={loans.length}
              shouldReduceMotion={shouldReduceMotion}
              locale={locale}
            />
          </section>

          <UserRecentActivity
            activities={recentActivities}
            now={now}
            locale={locale}
            onViewAll={() => navigate("/my-loans")}
          />

          <UserDashboardOverview
            loanCount={loans.length}
            shouldReduceMotion={shouldReduceMotion}
          />
        </>
      )}
    </motion.div>
  );
}

export default UserDashboardPage;
