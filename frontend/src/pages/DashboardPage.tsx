import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category, LibraryItem } from "../types/library";
import { getLibraryItemImage } from "../utils/libraryItemImage";
import { getDashboardStats } from "../services/dashboardService";
import type { DashboardStatsResponse } from "../services/dashboardService";
import {
  BookOpen,
  Tags,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  ChartNoAxesCombined,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion, useReducedMotion } from "motion/react";

type DashboardPageProps = {
  libraryItems: LibraryItem[];
  categories: Category[];
};

function DashboardPage({ libraryItems, categories }: DashboardPageProps) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [dashboardStats, setDashboardStats] =
    useState<DashboardStatsResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    getDashboardStats()
      .then((data) => {
        if (isMounted) {
          setDashboardStats(data);
        }
      })
      .catch((error) => {
        console.error("Kunde inte hämta dashboardstatistik.", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const borrowedItems = libraryItems.filter(
    (item) => item.borrower !== null,
  ).length;

  const availableItems = libraryItems.length - borrowedItems;

  const availabilityData = [
    {
      name: "Utlånade",
      antal: borrowedItems,
    },
    {
      name: "Tillgängliga",
      antal: availableItems,
    },
  ];

  const categoryData = categories.map((category) => ({
    name: category.name,
    antal: libraryItems.filter((item) => item.categoryId === category.id)
      .length,
  }));

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

  const now = new Date();

  const overdueItems = libraryItems.filter(
    (item) =>
      item.borrower !== null &&
      item.dueDate !== null &&
      new Date(item.dueDate) < now,
  ).length;

  const recentLoans = libraryItems
    .filter((item) => item.borrower !== null && item.borrowDate !== null)
    .sort(
      (a, b) =>
        new Date(b.borrowDate!).getTime() - new Date(a.borrowDate!).getTime(),
    )
    .slice(0, 5);

  const stats = [
    {
      key: "totalItems",
      label: "Totalt material",
      value: libraryItems.length,
      icon: BookOpen,
      description: "Bibliotekets samlade material",
    },
    {
      key: "categories",
      label: "Kategorier",
      value: categories.length,
      icon: Tags,
      description: "Organiserade kategorier",
    },
    {
      key: "borrowed",
      label: "Utlånade",
      value: borrowedItems,
      icon: ArrowUpRight,
      description: "Material som är utlånat",
    },
    {
      key: "available",
      label: "Tillgängliga",
      value: availableItems,
      icon: CircleCheck,
      description: "Material som inte är utlånat",
    },
    {
      key: "overdue",
      label: "Försenade lån",
      value: overdueItems,
      icon: CircleAlert,
      description: "Material med passerat återlämningsdatum",
    },
  ];

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
          <p className="eyebrow">DIN BIBLIOTEKSÖVERSIKT</p>
          <h2>Välkommen tillbaka!</h2>
          <p>
            Här får du en snabb överblick över biblioteket och dess material.
          </p>
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

      <section className="dashboard-stats" aria-label="Biblioteksstatistik">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const comparison = dashboardStats?.stats.find(
            (entry) => entry.key === stat.key,
          );
          const change = comparison?.change ?? 0;

          return (
            <article className="dashboard-stat-card" key={stat.label}>
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: shouldReduceMotion ? 0 : 0.2 + index * 0.12,
                  ease: "easeOut",
                }}
              >
                <div className="dashboard-stat-top">
                  <span className="dashboard-stat-icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.8} />
                  </span>

                  <span
                    className={`dashboard-stat-change ${
                      change > 0
                        ? "is-positive"
                        : change < 0
                          ? "is-negative"
                          : "is-neutral"
                    }`}
                  >
                    {change > 0 ? (
                      <TrendingUp size={14} strokeWidth={2.5} />
                    ) : change < 0 ? (
                      <TrendingDown size={14} strokeWidth={2.5} />
                    ) : (
                      <ChartNoAxesCombined size={14} strokeWidth={2.5} />
                    )}

                    <span>
                      {change > 0 ? "+" : ""}
                      {change}%
                    </span>
                  </span>
                </div>

                <p className="dashboard-stat-label">{stat.label}</p>
                <p className="dashboard-stat-value">{stat.value}</p>
                <p className="dashboard-stat-description">{stat.description}</p>
              </motion.div>
            </article>
          );
        })}
      </section>

      <div className="dashboard-panels">
        <section className="dashboard-chart-card">
          <div className="dashboard-chart-header">
            <p className="eyebrow">BIBLIOTEKSSTATISTIK</p>
            <h3>Utlånade kontra tillgängliga</h3>
            <p>Fördelningen av bibliotekets material just nu.</p>
          </div>

          <div className="dashboard-chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={availabilityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="antal"
                  name="Antal material"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="dashboard-category-card">
          <div className="dashboard-chart-header">
            <p className="eyebrow">KATEGORIÖVERSIKT</p>
            <h3>Material per kategori</h3>
            <p>Så fördelar sig bibliotekets material mellan kategorierna.</p>
          </div>

          {categoryData.length === 0 ? (
            <p>Det finns inga kategorier att visa.</p>
          ) : (
            <div className="dashboard-category-chart-container">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="antal"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={categoryColors[index % categoryColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="dashboard-recent-loans">
          <div className="dashboard-recent-loans-header">
            <div>
              <p className="eyebrow">UTLÅNINGSÖVERSIKT</p>
              <h3>Senaste lån</h3>
              <p>De fem senast utlånade posterna i biblioteket.</p>
            </div>
          </div>

          {recentLoans.length === 0 ? (
            <p className="dashboard-recent-loans-empty">
              Det finns inga aktiva lån att visa.
            </p>
          ) : (
            <div className="dashboard-recent-loans-list">
              {recentLoans.map((item) => {
                const isOverdue =
                  item.dueDate !== null && new Date(item.dueDate) < now;

                return (
                  <article className="dashboard-recent-loan" key={item.id}>
                    <div className="dashboard-recent-loan-details">
                      <img
                        className={`dashboard-recent-loan-cover ${
                          item.imageUrl ? "" : "is-default-image"
                        }`}
                        src={getLibraryItemImage(item)}
                        alt={`Omslag till ${item.title}`}
                      />

                      <div className="dashboard-recent-loan-info">
                        <h4>{item.title}</h4>
                        <p>Låntagare: {item.borrower}</p>
                        <p>
                          Utlånad:{" "}
                          {new Date(item.borrowDate!).toLocaleDateString(
                            "sv-SE",
                          )}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`dashboard-recent-loan-status ${
                        isOverdue ? "is-overdue" : "is-borrowed"
                      }`}
                    >
                      {isOverdue ? "Försenad" : "Utlånad"}
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
          <p className="eyebrow">SNABBÖVERSIKT</p>
          <h3>Ditt bibliotek på ett ställe</h3>
          <p>
            Du har {libraryItems.length} biblioteksposter fördelade över{" "}
            {categories.length} kategorier.
          </p>

          <button
            className="dashboard-library-button"
            type="button"
            onClick={() => navigate("/library")}
          >
            Utforska biblioteket
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
