import { Router } from "express";
import auth, { type AuthRequest } from "../middleware/auth.js";
import admin from "../middleware/admin.js";
import {
  borrowLibraryItem,
  returnLibraryItem,
  getUserLoans,
  getRecentLoans,
} from "../services/loan.service.js";

import {
  getAvailabilityHistory,
  type AvailabilityChartPeriod,
} from "../services/availabilityHistory.service.js";

const router = Router();

router.get("/availability-history", auth, admin, async (req, res) => {
  try {
    const period = req.query.period;

    if (
      period !== "week" &&
      period !== "month" &&
      period !== "sixMonths" &&
      period !== "year"
    ) {
      return res.status(400).json({
        message: "Ogiltig tidsperiod.",
      });
    }

    const history = await getAvailabilityHistory(
      period as AvailabilityChartPeriod,
    );

    return res.json(history);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte hämta bibliotekets utlåningshistorik.",
    });
  }
});

router.get("/my-loans", auth, async (req, res) => {
  try {
    const authUser = (req as AuthRequest).user;

    if (!authUser) {
      return res.status(401).json({
        message: "Du måste vara inloggad.",
      });
    }

    const loans = await getUserLoans(authUser.userId);

    return res.json(loans);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte hämta dina lån.",
    });
  }
});

router.get("/recent-loans", auth, admin, async (_req, res) => {
  try {
    const loans = await getRecentLoans();

    return res.json(loans);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte hämta de senaste lånen.",
    });
  }
});

router.post("/:id/borrow", auth, async (req, res) => {
  try {
    const authUser = (req as AuthRequest).user;

    if (!authUser) {
      return res.status(401).json({
        message: "Du måste vara inloggad.",
      });
    }

    const itemId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!itemId) {
      return res.status(400).json({
        message: "Ogiltigt library item ID.",
      });
    }

    const result = await borrowLibraryItem(authUser.userId, itemId);

    if (result.status !== 200) {
      return res.status(result.status).json({
        message: result.message,
      });
    }

    return res.json(result.item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte låna library item.",
    });
  }
});

router.post("/:id/return", auth, async (req, res) => {
  try {
    const authUser = (req as AuthRequest).user;

    if (!authUser) {
      return res.status(401).json({
        message: "Du måste vara inloggad.",
      });
    }

    const itemId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!itemId) {
      return res.status(400).json({
        message: "Ogiltigt library item ID.",
      });
    }

    const result = await returnLibraryItem(
      authUser.userId,
      authUser.role,
      itemId,
    );

    if (result.status !== 200) {
      return res.status(result.status).json({
        message: result.message,
      });
    }

    return res.json(result.item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte återlämna library item.",
    });
  }
});

export default router;
