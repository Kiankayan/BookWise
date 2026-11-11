import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Du måste vara inloggad för att komma åt denna resurs.",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Ingen giltig token skickades.",
    });
  }

  let decoded: AuthRequest["user"];

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthRequest["user"];
  } catch {
    return res.status(401).json({
      message: "Ogiltig eller utgången token.",
    });
  }

  if (
    !decoded ||
    typeof decoded.userId !== "string" ||
    (decoded.role !== "USER" && decoded.role !== "ADMIN")
  ) {
    return res.status(401).json({
      message: "Ogiltig token.",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        isActive: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Användarkontot kunde inte hittas.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Ditt konto är inaktiverat.",
      });
    }

    (req as AuthRequest).user = {
      userId: decoded.userId,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
