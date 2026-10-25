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

    const [currentMonthEvents, previousMonthEvents] = await Promise.all([
      prisma.libraryEvent.count({
        where: {
          createdAt: {
            gte: currentMonthStart,
            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
          },
        },
      }),
      prisma.libraryEvent.count({
        where: {
          createdAt: {
            gte: previousMonthStart,
            lt: currentMonthStart,
          },
        },
      }),
    ]);

    res.json({
      currentMonthEvents,
      previousMonthEvents,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta dashboardstatistik.",
    });
  }
});

export default router;
