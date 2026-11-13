import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";

const RESET_TOKEN_EXPIRATION_MINUTES = 30;

export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000,
  );

  return {
    token,
    tokenHash,
    expiresAt,
  };
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createPasswordResetToken(userId: string) {
  const { token, tokenHash, expiresAt } = generatePasswordResetToken();

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}
