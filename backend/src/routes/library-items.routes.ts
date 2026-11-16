import {
  Router,
  prisma,
  Prisma,
  auth,
  admin,
  createLibraryItemSchema,
  updateLibraryItemSchema,
} from "../index.js";

const router = Router();

router.post("/", auth, admin, async (req, res) => {
  try {
    const result = createLibraryItemSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Ogiltigt library item.",
        errors: result.error.flatten(),
      });
    }

    const libraryItem = await prisma.$transaction(async (tx) => {
      const item = await tx.libraryItem.create({
        data: result.data,
        include: {
          category: true,
        },
      });

      await tx.libraryEvent.create({
        data: {
          type: "ITEM_CREATED",
          itemId: item.id,
          itemTitle: item.title,
          categoryId: item.categoryId,
          categoryName: item.category.name,
        },
      });

      return item;
    });

    res.status(201).json(libraryItem);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return res.status(404).json({
        message: "Kategorin kunde inte hittas.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Kunde inte skapa library item.",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const sort = req.query.sort;

    let orderBy:
      | { title: "asc" | "desc" }
      | { category: { name: "asc" } }
      | { type: "asc" } = { title: "asc" };

    switch (sort) {
      case "title-asc":
        orderBy = { title: "asc" };
        break;

      case "title-desc":
        orderBy = { title: "desc" };
        break;

      case "category":
        orderBy = { category: { name: "asc" } };
        break;

      case "type":
        orderBy = { type: "asc" };
        break;
    }

    const libraryItems = await prisma.libraryItem.findMany({
      where: {
        archivedAt: null,
      },
      include: {
        category: true,
        loans: {
          where: {
            returnedAt: null,
          },
          select: {
            userId: true,
            borrowerName: true,
            borrowDate: true,
            dueDate: true,
          },
          orderBy: {
            borrowDate: "desc",
          },
          take: 1,
        },
      },
      orderBy,
    });

    res.json(libraryItems);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta library items.",
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt bok-ID.",
    });
  }

  try {
    const libraryItem = await prisma.libraryItem.findFirst({
      where: {
        id,
        archivedAt: null,
      },
      include: {
        category: true,
      },
    });

    if (!libraryItem) {
      return res.status(404).json({
        message: "Library item kunde inte hittas.",
      });
    }

    res.json(libraryItem);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta library item.",
    });
  }
});

router.put("/:id", auth, admin, async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt bok-ID.",
    });
  }

  try {
    const result = updateLibraryItemSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Ogiltigt library item.",
        errors: result.error.flatten(),
      });
    }

    const libraryItem = await prisma.libraryItem.updateMany({
      where: {
        id,
        archivedAt: null,
      },
      data: result.data,
    });

    if (libraryItem.count === 0) {
      return res.status(404).json({
        message: "Library item kunde inte hittas.",
      });
    }

    const updatedLibraryItem = await prisma.libraryItem.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    });

    return res.json(updatedLibraryItem);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return res.status(404).json({
        message: "Kategorin kunde inte hittas.",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Kunde inte uppdatera library item.",
    });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "Ogiltigt bok-ID.",
    });
  }

  try {
    const libraryItem = await prisma.libraryItem.findFirst({
      where: {
        id,
        archivedAt: null,
      },
    });

    if (!libraryItem) {
      return res.status(404).json({
        message: "Biblioteksposten kunde inte hittas.",
      });
    }

    const activeLoan = await prisma.loan.findFirst({
      where: {
        itemId: id,
        returnedAt: null,
      },
    });

    if (activeLoan) {
      return res.status(409).json({
        message:
          "Boken kan inte arkiveras eftersom den är utlånad. Registrera återlämningen först.",
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.libraryEvent.create({
        data: {
          type: "ITEM_DELETED",
          itemId: libraryItem.id,
          itemTitle: libraryItem.title,
          categoryId: libraryItem.categoryId,
        },
      });

      await tx.libraryItem.update({
        where: {
          id,
        },
        data: {
          archivedAt: new Date(),
        },
      });
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte arkivera biblioteksposten.",
    });
  }
});

export default router;
