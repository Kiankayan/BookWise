import { prisma } from "../lib/prisma.js";

export async function borrowLibraryItem(userId: string, itemId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return {
      status: 401 as const,
      message: "Användarkontot kunde inte hittas.",
    };
  }

  const libraryItem = await prisma.libraryItem.findUnique({
    where: {
      id: itemId,
    },
  });

  if (!libraryItem) {
    return {
      status: 404 as const,
      message: "Library item kunde inte hittas.",
    };
  }

  if (!libraryItem.isBorrowable) {
    return {
      status: 400 as const,
      message: "Detta library item kan inte lånas.",
    };
  }

  const now = new Date();
  const dueDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const item = await prisma.$transaction(async (tx) => {
    const resultUpdate = await tx.libraryItem.updateMany({
      where: {
        id: itemId,
        isBorrowable: true,
        borrower: null,
        borrowDate: null,
      },
      data: {
        borrower: user.name,
        borrowDate: now,
        dueDate,
      },
    });

    if (resultUpdate.count === 0) {
      return null;
    }

    const updatedItem = await tx.libraryItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        category: true,
      },
    });

    if (!updatedItem) {
      throw new Error("Library item kunde inte hittas efter utlåning.");
    }

    await tx.loan.create({
      data: {
        userId: user.id,
        itemId: updatedItem.id,
        borrowerName: user.name,
        borrowDate: now,
        dueDate,
      },
    });

    await tx.libraryEvent.create({
      data: {
        type: "BORROWED",
        itemId: updatedItem.id,
        itemTitle: updatedItem.title,
        categoryId: updatedItem.categoryId,
        categoryName: updatedItem.category.name,
        dueDate,
      },
    });

    return updatedItem;
  });

  if (!item) {
    return {
      status: 409 as const,
      message: "Library item är redan utlånat eller kan inte lånas.",
    };
  }

  return {
    status: 200 as const,
    item,
  };
}

export async function returnLibraryItem(
  userId: string,
  role: "USER" | "ADMIN",
  itemId: string,
) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.libraryItem.findUnique({
      where: {
        id: itemId,
      },
      include: {
        category: true,
      },
    });

    if (!item) {
      return {
        status: 404 as const,
        message: "Library item kunde inte hittas.",
      };
    }

    const activeLoan = await tx.loan.findFirst({
      where: {
        itemId,
        returnedAt: null,
        ...(role === "ADMIN" ? {} : { userId }),
      },
    });

    if (!activeLoan) {
      return {
        status: 409 as const,
        message: "Du har inget aktivt lån för detta library item.",
      };
    }

    const now = new Date();

    const loanUpdate = await tx.loan.updateMany({
      where: {
        id: activeLoan.id,
        returnedAt: null,
      },
      data: {
        returnedAt: now,
      },
    });

    if (loanUpdate.count === 0) {
      return {
        status: 409 as const,
        message: "Lånet har redan återlämnats.",
      };
    }

    await tx.libraryItem.update({
      where: {
        id: itemId,
      },
      data: {
        borrower: null,
        borrowDate: null,
        dueDate: null,
      },
    });

    await tx.libraryEvent.create({
      data: {
        type: "RETURNED",
        itemId: item.id,
        itemTitle: item.title,
        categoryId: item.categoryId,
        categoryName: item.category.name,
        dueDate: activeLoan.dueDate,
      },
    });

    return {
      status: 200 as const,
      item: {
        ...item,
        borrower: null,
        borrowDate: null,
        dueDate: null,
      },
    };
  });
}

export async function getUserLoans(userId: string) {
  return prisma.loan.findMany({
    where: {
      userId,
    },
    include: {
      item: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      borrowDate: "desc",
    },
  });
}
