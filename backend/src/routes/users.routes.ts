import { Router, Request } from "express";
import { prisma } from "../lib/prisma.js";
import auth, { AuthRequest } from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = Router();

router.get("/", auth, admin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.status(200).json({
    users,
  });
});

router.get("/:id", auth, admin, async (req: Request, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt användar-ID.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "Användaren kunde inte hittas.",
    });
  }

  return res.status(200).json({
    user,
  });
});

export default router;
