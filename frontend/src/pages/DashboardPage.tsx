import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Category, LibraryItem } from "../types/library";
import type { Loan } from "../types/loan";
import { getLibraryItemImage } from "../utils/libraryItemImage";
import {
  BookOpen,
  Tags,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  ChartNoAxesCombined,
  Clock3,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AvailabilityHistoryPoint,
  ChartPeriod,
} from "../utils/dashboardChartData";
import { getAvailabilityHistory } from "../services/LibraryItemService";
import { getRecentLoans } from "../services/LoanService";
import { motion, useReducedMotion } from "motion/react";
import DashboardStats from "../components/dashboard/DashboardStats";
import CategoryChart from "../components/dashboard/CategoryChart";

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

  const illustrationTransition = {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      className="dashboard-page"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-content">
          <p className="eyebrow">{t("dashboard.welcomeEyebrow")}</p>
          <h2>{t("dashboard.welcomeTitle")}</h2>
          <p>{t("dashboard.welcomeDescription")}</p>
        </div>

        <div className="dashboard-book-illustration">
          <motion.img
            className="dashboard-welcome-illustration"
            src="/images/dashboard-open-book.png"
            alt=""
            aria-hidden="true"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    y: [0, -6, 0],
                    rotate: [0, 0.5, 0],
                  }
            }
            transition={illustrationTransition}
          />

          <motion.img
            className="dashboard-book-page-test"
            src="/images/book-page-test.png"
            alt=""
            aria-hidden="true"
            style={{ transformOrigin: "bottom center" }}
            animate={shouldReduceMotion ? undefined : { rotate: [0, -12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </section>

      <DashboardStats
        stats={stats}
        percentageChanges={percentageChanges}
        shouldReduceMotion={shouldReduceMotion}
        locale={locale}
        ariaLabel={t("dashboard.statistics")}
      />

      <div className="dashboard-panels">
        <section className="dashboard-chart-card">
          <div className="dashboard-chart-heading">
            <div className="dashboard-chart-icon" aria-hidden="true">
              <ChartNoAxesCombined size={22} strokeWidth={1.8} />
            </div>

            <h3>{t("dashboard.availabilityChart")}</h3>

            <select
              className="dashboard-chart-period"
              value={chartPeriod}
              onChange={(event) =>
                setChartPeriod(event.target.value as ChartPeriod)
              }
              aria-label={t("dashboard.periodLabel")}
            >
              <option value="week">{t("dashboard.lastWeek")}</option>
              <option value="month">{t("dashboard.lastMonth")}</option>
              <option value="sixMonths">{t("dashboard.lastSixMonths")}</option>
              <option value="year">{t("dashboard.lastYear")}</option>
            </select>
          </div>

          <div className="dashboard-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={availabilityData}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                barCategoryGap="22%"
                barGap={4}
              >
                <CartesianGrid
                  stroke="#eeeaf7"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#807990", fontSize: 12 }}
                  dy={8}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#807990", fontSize: 12 }}
                  width={34}
                />

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ paddingTop: 20, fontSize: 12 }}
                />

                <Bar
                  dataKey="available"
                  name={t("dashboard.availableLegend")}
                  fill="#c9b8fa"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />

                <Bar
                  dataKey="borrowed"
                  name={t("dashboard.borrowedLegend")}
                  fill="#7138df"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <CategoryChart
          categoryData={categoryData}
          totalItems={libraryItems.length}
          shouldReduceMotion={shouldReduceMotion}
          locale={locale}
        />

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
              onClick={() => navigate("/library")}
            >
              {t("dashboard.viewAll")}
              <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          {recentLoans.length === 0 ? (
            <p className="dashboard-recent-loans-empty">
              {t("dashboard.noLoans")}
            </p>
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

                    <span
                      className={`dashboard-recent-loan-status ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="dashboard-overview-card">
        <div className="dashboard-overview-content">
          <p className="eyebrow">{t("dashboard.overviewEyebrow")}</p>
          <h3>{t("dashboard.overviewTitle")}</h3>
          <p>
            {t("dashboard.overviewDescription", {
              itemCount: libraryItems.length,
              categoryCount: categories.length,
            })}
          </p>

          <button
            className="dashboard-library-button"
            type="button"
            onClick={() => navigate("/library")}
          >
            {t("dashboard.exploreLibrary")}
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <motion.img
          className="dashboard-overview-illustration"
          src="/images/dashboard-book-stack.png"
          alt=""
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  y: [0, -5, 0],
                  rotate: [0, 1, 0],
                }
          }
          transition={{
            ...illustrationTransition,
            duration: 6,
            delay: 0.5,
          }}
        />
      </section>
    </motion.div>
  );
}

export default DashboardPage;
