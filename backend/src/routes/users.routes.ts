import { Router, Request } from "express";
import { prisma, Prisma } from "../lib/prisma.js";
import auth, { AuthRequest } from "../middleware/auth.js";
import admin from "../middleware/admin.js";

const router = Router();

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  gender: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

router.get("/", auth, admin, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: userSelect,
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
    select: userSelect,
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

router.patch("/:id/role", auth, admin, async (req: Request, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt användar-ID.",
    });
  }

  const { role } = req.body;

  if (role !== "USER" && role !== "ADMIN") {
    return res.status(400).json({
      message: "Ogiltig användarroll.",
    });
  }

  const currentUserId = (req as AuthRequest).user?.userId;

  if (id === currentUserId && role !== "ADMIN") {
    return res.status(400).json({
      message: "Du kan inte ta bort din egen administratörsbehörighet.",
    });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
      select: userSelect,
    });

    return res.status(200).json({
      message: "Användarrollen har uppdaterats.",
      user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Användaren kunde inte hittas.",
      });
    }

    throw error;
  }
});

router.patch("/:id/status", auth, admin, async (req: Request, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt användar-ID.",
    });
  }

  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({
      message: "Ogiltig kontostatus.",
    });
  }

  const currentUserId = (req as AuthRequest).user?.userId;

  if (id === currentUserId && !isActive) {
    return res.status(400).json({
      message: "Du kan inte inaktivera ditt eget konto.",
    });
  }

  try {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
      select: userSelect,
    });

    return res.status(200).json({
      message: isActive
        ? "Användarkontot har aktiverats."
        : "Användarkontot har inaktiverats.",
      user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Användaren kunde inte hittas.",
      });
    }

    throw error;
  }
});

router.delete("/:id", auth, admin, async (req: Request, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt användar-ID.",
    });
  }

  const currentUserId = (req as AuthRequest).user?.userId;

  if (id === currentUserId) {
    return res.status(400).json({
      message: "Du kan inte ta bort ditt eget konto.",
    });
  }

  try {
    const activeLoans = await prisma.loan.count({
      where: {
        userId: id,
        returnedAt: null,
      },
    });

    if (activeLoans > 0) {
      return res.status(409).json({
        message: "Användaren har aktiva lån och kan inte tas bort.",
      });
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Användaren har tagits bort.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Användaren kunde inte hittas.",
      });
    }

    throw error;
  }
});

export default router;
