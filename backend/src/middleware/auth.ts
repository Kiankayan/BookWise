import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: "USER" | "ADMIN";
  };
}

export default function auth(req: Request, res: Response, next: NextFunction) {
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

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as AuthRequest["user"];

    if (
      !decoded ||
      typeof decoded.userId !== "string" ||
      (decoded.role !== "USER" && decoded.role !== "ADMIN")
    ) {
      return res.status(401).json({
        message: "Ogiltig token.",
      });
    }

    (req as AuthRequest).user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Ogiltig eller utgången token.",
    });
  }
}
