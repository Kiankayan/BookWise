import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [items, categories, events] = await Promise.all([
      prisma.libraryItem.findMany({
        select: {
          id: true,
          borrower: true,
          dueDate: true,
        },
      }),
      prisma.category.count(),
      prisma.libraryEvent.findMany({
        where: {
          createdAt: {
            lt: nextMonthStart,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const itemEvents = events.filter((event) => event.itemId !== null);

    const categoryEvents = events.filter(
      (event) =>
        event.type === "CATEGORY_CREATED" || event.type === "CATEGORY_DELETED",
    );

    const currentBorrowed = items.filter(
      (item) => item.borrower !== null,
    ).length;

    const currentAvailable = items.length - currentBorrowed;

    const currentOverdue = items.filter(
      (item) =>
        item.borrower !== null && item.dueDate !== null && item.dueDate < now,
    ).length;

    const getPreviousItemCount = () => {
      let count = items.length;

      for (const event of itemEvents) {
        if (event.createdAt >= currentMonthStart) {
          if (event.type === "ITEM_CREATED") count -= 1;
          if (event.type === "ITEM_DELETED") count += 1;
        }
      }

      return count;
    };

    const getPreviousCategoryCount = () => {
      let count = categories;

      for (const event of categoryEvents) {
        if (event.createdAt >= currentMonthStart) {
          if (event.type === "CATEGORY_CREATED") count -= 1;
          if (event.type === "CATEGORY_DELETED") count += 1;
        }
      }

      return count;
    };

    const getPreviousBorrowedCount = () => {
      let count = currentBorrowed;

      for (const event of events) {
        if (event.createdAt >= currentMonthStart) {
          if (event.type === "BORROWED") count -= 1;
          if (event.type === "RETURNED") count += 1;
        }
      }

      return count;
    };

    const previousItems = getPreviousItemCount();
    const previousCategories = getPreviousCategoryCount();
    const previousBorrowed = getPreviousBorrowedCount();

    const hasPreviousMonthHistory = events.some(
      (event) =>
        event.createdAt >= previousMonthStart &&
        event.createdAt < currentMonthStart,
    );

    const hasReliableComparison = hasPreviousMonthHistory;

    const stats = [
      {
        key: "totalItems",
        current: items.length,
        previous: previousItems,
      },
      {
        key: "categories",
        current: categories,
        previous: previousCategories,
      },
      {
        key: "borrowed",
        current: currentBorrowed,
        previous: previousBorrowed,
      },
      {
        key: "available",
        current: currentAvailable,
        previous: previousItems - previousBorrowed,
      },
      {
        key: "overdue",
        current: currentOverdue,
        previous: null,
      },
    ].map((stat) => {
      const change =
        stat.previous === null || stat.previous === 0
          ? null
          : Math.round(((stat.current - stat.previous) / stat.previous) * 100);

      return {
        ...stat,
        change,
      };
    });

    res.json({
      stats,
      hasPreviousMonthHistory,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta dashboardstatistik.",
    });
  }
});

export default router;
