import { ChartNoAxesCombined } from "lucide-react";
import { useTranslation } from "react-i18next";
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
} from "../../utils/dashboardChartData";

type AvailabilityChartProps = {
  availabilityData: AvailabilityHistoryPoint[];
  chartPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
};

function AvailabilityChart({
  availabilityData,
  chartPeriod,
  onPeriodChange,
}: AvailabilityChartProps) {
  const { t } = useTranslation();

  return (
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
            onPeriodChange(event.target.value as ChartPeriod)
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
  );
}

export default AvailabilityChart;
