import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { BookOpen, CircleAlert, CircleCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ChartPeriod } from "../components/user-dashboard/UserLoanChart";
import UserDashboardWelcome from "../components/user-dashboard/UserDashboardWelcome";
import UserDashboardStats from "../components/user-dashboard/UserDashboardStats";
import UserLoanChart from "../components/user-dashboard/UserLoanChart";
import UserCategoryChart from "../components/user-dashboard/UserCategoryChart";
import UserRecentActivity from "../components/user-dashboard/UserRecentActivity";
import UserDashboardOverview from "../components/user-dashboard/UserDashboardOverview";
import useUserDashboard from "../hooks/useUserDashboard";

function UserDashboardPage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslation();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("week");

  const {
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
  } = useUserDashboard(chartPeriod);

  const stats = [
    {
      key: "activeLoans" as const,
      label: t("userDashboard.activeLoans"),
      value: activeLoans.length,
      icon: BookOpen,
      description: t("userDashboard.activeLoansDescription"),
    },
    {
      key: "overdueLoans" as const,
      label: t("userDashboard.overdueLoans"),
      value: overdueLoans.length,
      icon: CircleAlert,
      description: t("userDashboard.overdueLoansDescription"),
    },
    {
      key: "returnedLoans" as const,
      label: t("userDashboard.returnedLoans"),
      value: returnedLoans.length,
      icon: CircleCheck,
      description: t("userDashboard.returnedLoansDescription"),
    },
  ];

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
