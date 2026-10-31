import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.js";

export default function admin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthRequest).user;

  if (!user) {
    return res.status(401).json({
      message: "Du måste vara inloggad.",
    });
  }

  if (user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Du saknar behörighet för denna åtgärd.",
    });
  }

  next();
}
