import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, prisma } from "../lib/prisma.js";
import { loginUserSchema, registerUserSchema } from "../schemas/user.schema.js";
import {
  createSession,
  rotateSession,
  revokeSession,
} from "../services/session.service.js";

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

  const { name, email, password, gender } = validation.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        gender,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
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

  const { email, password, rememberMe } = validation.data;

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

  const { refreshToken, session } = await createSession(user.id, rememberMe);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: session.expiresAt.getTime() - Date.now(),
  });

  return res.status(200).json({
    message: "Inloggningen lyckades.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
    },
  });
});

router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Ingen aktiv session hittades.",
    });
  }

  const rotatedSession = await rotateSession(refreshToken);

  if (!rotatedSession) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(401).json({
      message: "Sessionen har gått ut eller är ogiltig.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: rotatedSession.session.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    await revokeSession(rotatedSession.refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    return res.status(401).json({
      message: "Kontot är inte längre aktivt.",
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

  res.cookie("refreshToken", rotatedSession.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: rotatedSession.session.expiresAt.getTime() - Date.now(),
  });

  return res.status(200).json({
    message: "Sessionen har förnyats.",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gender: user.gender,
    },
  });
});

router.post("/logout", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await revokeSession(refreshToken);
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });

  return res.status(200).json({
    message: "Du har loggats ut.",
  });
});

export default router;
