import { useNavigate } from "react-router-dom";
import type { Category, LibraryItem } from "../types/library";
import {
  BookOpen,
  Tags,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
      label: "Totalt material",
      value: libraryItems.length,
      icon: BookOpen,
      description: "Bibliotekets samlade material",
    },
    {
      label: "Kategorier",
      value: categories.length,
      icon: Tags,
      description: "Organiserade kategorier",
    },
    {
      label: "Utlånade",
      value: borrowedItems,
      icon: ArrowUpRight,
      description: "Material som är utlånat",
    },
    {
      label: "Tillgängliga",
      value: availableItems,
      icon: CircleCheck,
      description: "Material som inte är utlånat",
    },
    {
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
                </div>

                <p className="dashboard-stat-label">{stat.label}</p>
                <p className="dashboard-stat-value">{stat.value}</p>
                <p className="dashboard-stat-description">{stat.description}</p>
              </motion.div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-chart-card">
        <div className="dashboard-chart-header">
          <p className="eyebrow">BIBLIOTEKSSTATISTIK</p>
          <h3>Utlånade kontra tillgängliga</h3>
          <p>Fördelningen av bibliotekets material just nu.</p>
        </div>

        <div className="dashboard-chart-container">
          <ResponsiveContainer width="100%" height={300}>
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
                  <div className="dashboard-recent-loan-info">
                    <h4>{item.title}</h4>
                    <p>Låntagare: {item.borrower}</p>
                    <p>
                      Utlånad:{" "}
                      {new Date(item.borrowDate!).toLocaleDateString("sv-SE")}
                    </p>
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
