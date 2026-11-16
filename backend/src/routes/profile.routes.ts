import { Router, type Request } from "express";
import {
  Prisma,
  prisma,
  auth,
  type AuthRequest,
  updateProfileSchema,
} from "../index.js";

const router = Router();

router.get("/me", auth, async (req: Request, res) => {
  const userId = (req as AuthRequest).user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Du måste vara inloggad.",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      avatarUrl: true,
      createdAt: true,
    },
  });

  if (!user) {
    return res.status(404).json({
      message: "Användaren kunde inte hittas.",
    });
  }

  return res.status(200).json({ user });
});

router.put("/me", auth, async (req: Request, res) => {
  const userId = (req as AuthRequest).user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Du måste vara inloggad.",
    });
  }

  const validation = updateProfileSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Ogiltiga profiluppgifter.",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { name, email, avatarUrl } = validation.data;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email.toLowerCase(),
        avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      message: "Profilen har uppdaterats.",
      user,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "E-postadressen används redan.",
      });
    }

    throw error;
  }
});

export default router;
