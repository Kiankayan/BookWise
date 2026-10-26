export type ChartPeriod = "week" | "month" | "sixMonths" | "year";

export type AvailabilityHistoryPoint = {
  label: string;
  borrowed: number;
  available: number;
};

const monthlyHistory: AvailabilityHistoryPoint[] = [
  { label: "Maj", borrowed: 24, available: 59 },
  { label: "Jun", borrowed: 26, available: 57 },
  { label: "Jul", borrowed: 32, available: 68 },
  { label: "Aug", borrowed: 31, available: 60 },
  { label: "Sep", borrowed: 31, available: 62 },
  { label: "Okt", borrowed: 36, available: 106 },
];

const dailyBorrowed = [
  25, 27, 26, 29, 28, 31, 30, 32, 29, 34, 33, 31, 35, 32, 36, 34, 30, 33, 35,
  31, 34, 32, 36, 33, 35, 31, 34, 36, 32, 36,
];

export function getAvailabilityHistory(
  period: ChartPeriod,
): AvailabilityHistoryPoint[] {
  if (period === "sixMonths") {
    return monthlyHistory;
  }

  if (period === "year") {
    return [
      { label: "Nov", borrowed: 22, available: 58 },
      { label: "Dec", borrowed: 24, available: 56 },
      { label: "Jan", borrowed: 23, available: 60 },
      { label: "Feb", borrowed: 25, available: 59 },
      { label: "Mar", borrowed: 27, available: 63 },
      { label: "Apr", borrowed: 28, available: 65 },
      ...monthlyHistory,
    ];
  }

  if (period === "month") {
    return dailyBorrowed.map((borrowed, index) => ({
      label: `${index + 1}`,
      borrowed,
      available: 142 - borrowed,
    }));
  }

  return dailyBorrowed.slice(-7).map((borrowed, index) => ({
    label: ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"][index],
    borrowed,
    available: 142 - borrowed,
  }));
}
