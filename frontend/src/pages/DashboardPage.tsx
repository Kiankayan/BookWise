import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Category, LibraryItem } from "../types/library";
import type { Loan } from "../types/loan";
import {
  BookOpen,
  Tags,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import type {
  AvailabilityHistoryPoint,
  ChartPeriod,
} from "../utils/dashboardChartData";
import { getAvailabilityHistory } from "../services/LibraryItemService";
import { getRecentLoans } from "../services/LoanService";
import { motion, useReducedMotion } from "motion/react";
import DashboardStats from "../components/dashboard/DashboardStats";
import CategoryChart from "../components/dashboard/CategoryChart";
import AvailabilityChart from "../components/dashboard/AvailabilityChart";
import RecentLoans from "../components/dashboard/RecentLoans";
import DashboardWelcome from "../components/dashboard/DashboardWelcome";
import DashboardOverview from "../components/dashboard/DashboardOverview";

type DashboardPageProps = {
  libraryItems: LibraryItem[];
  categories: Category[];
};

function DashboardPage({ libraryItems, categories }: DashboardPageProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("sv") ? "sv-SE" : "en-US";

  const borrowedItems = libraryItems.filter(
    (item) => item.borrower !== null,
  ).length;

  const availableItems = libraryItems.length - borrowedItems;

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

  const [availabilityData, setAvailabilityData] = useState<
    AvailabilityHistoryPoint[]
  >([]);

  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);

  useEffect(() => {
    let isMounted = true;

    getAvailabilityHistory(chartPeriod)
      .then((response) => {
        if (isMounted) {
          setAvailabilityData(response.data);
        }
      })
      .catch((error) => {
        console.error("Could not fetch chart data:", error);

        if (isMounted) {
          setAvailabilityData([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [chartPeriod]);

  useEffect(() => {
    let isMounted = true;

    getRecentLoans()
      .then((response) => {
        if (isMounted) {
          setRecentLoans(response.data);
        }
      })
      .catch((error) => {
        console.error("Could not fetch recent loans:", error);

        if (isMounted) {
          setRecentLoans([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryData = categories.map((category) => ({
    name: category.name,
    antal: libraryItems.filter((item) => item.categoryId === category.id)
      .length,
  }));

  const now = new Date();

  const overdueItems = libraryItems.filter(
    (item) =>
      item.borrower !== null &&
      item.dueDate !== null &&
      new Date(item.dueDate) < now,
  ).length;

  const stats = [
    {
      key: "totalItems",
      label: t("dashboard.totalItems"),
      value: libraryItems.length,
      icon: BookOpen,
      description: t("dashboard.totalItemsDescription"),
    },
    {
      key: "categories",
      label: t("dashboard.categories"),
      value: categories.length,
      icon: Tags,
      description: t("dashboard.categoriesDescription"),
    },
    {
      key: "borrowed",
      label: t("dashboard.borrowed"),
      value: borrowedItems,
      icon: ArrowUpRight,
      description: t("dashboard.borrowedDescription"),
    },
    {
      key: "available",
      label: t("dashboard.available"),
      value: availableItems,
      icon: CircleCheck,
      description: t("dashboard.availableDescription"),
    },
    {
      key: "overdue",
      label: t("dashboard.overdue"),
      value: overdueItems,
      icon: CircleAlert,
      description: t("dashboard.overdueDescription"),
    },
  ];

  const currentValues = {
    totalItems: libraryItems.length,
    categories: categories.length,
    borrowed: borrowedItems,
    available: availableItems,
    overdue: overdueItems,
  };

  type StatKey = keyof typeof currentValues;

  const [percentageChanges, setPercentageChanges] = useState<
    Record<StatKey, number>
  >({
    totalItems: 0,
    categories: 0,
    borrowed: 0,
    available: 0,
    overdue: 0,
  });

  useEffect(() => {
    const storageKey = "bookwise-dashboard-percentage";
    const storedData = sessionStorage.getItem(storageKey);

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

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ values: currentValues, changes }),
    );

    setPercentageChanges(changes);
  }, [
    libraryItems.length,
    categories.length,
    borrowedItems,
    availableItems,
    overdueItems,
  ]);

  return (
    <motion.div
      className="dashboard-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <DashboardWelcome shouldReduceMotion={shouldReduceMotion} />

      <DashboardStats
        stats={stats}
        percentageChanges={percentageChanges}
        shouldReduceMotion={shouldReduceMotion}
        locale={locale}
        ariaLabel={t("dashboard.statistics")}
      />

      <div className="dashboard-panels">
        <AvailabilityChart
          availabilityData={availabilityData}
          chartPeriod={chartPeriod}
          onPeriodChange={setChartPeriod}
        />

        <CategoryChart
          categoryData={categoryData}
          totalItems={libraryItems.length}
          shouldReduceMotion={shouldReduceMotion}
          locale={locale}
        />

        <RecentLoans
          recentLoans={recentLoans}
          now={now}
          locale={locale}
          onViewAll={() => navigate("/library")}
        />
      </div>

      <DashboardOverview
        eyebrow={t("dashboard.overviewEyebrow")}
        title={t("dashboard.overviewTitle")}
        description={t("dashboard.overviewDescription", {
          itemCount: libraryItems.length,
          categoryCount: categories.length,
        })}
        exploreLibrary={t("dashboard.exploreLibrary")}
        shouldReduceMotion={shouldReduceMotion}
        onExploreLibrary={() => navigate("/library")}
      />
    </motion.div>
  );
}

export default DashboardPage;
