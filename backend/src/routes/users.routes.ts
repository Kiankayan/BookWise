import { Router } from "express";
import bcrypt from "bcrypt";
import { Prisma, prisma } from "../lib/prisma.js";
import { registerUserSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/register", async (req, res) => {
  const validation = registerUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Ogiltiga registreringsuppgifter.",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { name, email, password } = validation.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Kontot har skapats.",
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
