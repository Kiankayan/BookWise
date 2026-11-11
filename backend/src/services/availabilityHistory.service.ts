import { prisma } from "../lib/prisma.js";

export type AvailabilityChartPeriod = "week" | "month" | "sixMonths" | "year";

export type AvailabilityHistoryPoint = {
  label: string;
  borrowed: number;
  available: number;
};

function getChartDates(period: AvailabilityChartPeriod, now: Date): Date[] {
  const dates: Date[] = [];

  if (period === "week" || period === "month") {
    const days = period === "week" ? 7 : 30;

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(23, 59, 59, 999);
      dates.push(date);
    }

    return dates;
  }

  const months = period === "sixMonths" ? 6 : 12;

  for (let i = months - 1; i >= 0; i--) {
    const date =
      i === 0
        ? new Date(now)
        : new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    date.setHours(23, 59, 59, 999);
    dates.push(date);
  }

  return dates;
}

export async function getAvailabilityHistory(
  period: AvailabilityChartPeriod,
): Promise<AvailabilityHistoryPoint[]> {
  const now = new Date();
  const dates = getChartDates(period, now);

  const events = await prisma.libraryEvent.findMany({
    where: {
      createdAt: {
        lte: now,
      },
    },
    orderBy: [
      {
        createdAt: "asc",
      },
      {
        id: "asc",
      },
    ],
  });

  let totalItems = 0;
  let borrowedItems = 0;
  let eventIndex = 0;

  return dates.map((date) => {
    while (eventIndex < events.length && events[eventIndex].createdAt <= date) {
      const event = events[eventIndex];

      if (event.type === "ITEM_CREATED") {
        totalItems++;
      }

      if (event.type === "ITEM_DELETED") {
        totalItems--;
      }

      if (event.type === "BORROWED") {
        borrowedItems++;
      }

      if (event.type === "RETURNED") {
        borrowedItems--;
      }

      eventIndex++;
    }

    return {
      label: date.toLocaleDateString("sv-SE", {
        day: "numeric",
        month: "short",
      }),
      borrowed: borrowedItems,
      available: totalItems - borrowedItems,
    };
  });
}
