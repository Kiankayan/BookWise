import { randomBytes, createHash } from "node:crypto";
import { prisma } from "../lib/prisma.js";

function generateRefreshToken() {
  return randomBytes(64).toString("hex");
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, expiresInDays: number) {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      createdAt: true,
      revokedAt: true,
    },
  });

  return {
    session,
    refreshToken,
  };
}

export async function rotateSession(
  refreshToken: string,
  expiresInDays: number,
) {
  const tokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          isActive: true,
        },
      },
    },
  });

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    !session.user.isActive
  ) {
    return null;
  }

  const newRefreshToken = generateRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);

  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const newSession = await prisma.$transaction(async (tx) => {
    const revokedSession = await tx.session.updateMany({
      where: {
        id: session.id,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (revokedSession.count === 0) {
      return null;
    }

    return tx.session.create({
      data: {
        userId: session.userId,
        tokenHash: newTokenHash,
        expiresAt,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        revokedAt: true,
      },
    });
  });

  if (!newSession) {
    return null;
  }

  return {
    session: newSession,
    refreshToken: newRefreshToken,
  };
}

export async function revokeSession(refreshToken: string) {
  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.session.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
