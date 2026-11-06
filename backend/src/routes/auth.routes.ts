import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, prisma } from "../lib/prisma.js";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";
import { createSession } from "../services/session.service.js";

const router = Router();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET saknas i miljövariablerna.");
}

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

router.post("/login", async (req, res) => {
  const validation = loginUserSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Ogiltiga inloggningsuppgifter.",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (!user) {
    return res.status(401).json({
      message: "Felaktig e-postadress eller lösenord.",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Felaktig e-postadress eller lösenord.",
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      message: "Ditt konto är inaktiverat. Kontakta administratören.",
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "15m",
    },
  );

  const { refreshToken } = await createSession(user.id, 30);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    message: "Inloggningen lyckades.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export default router;
