import { Router } from "express";
import { prisma, Prisma } from "../lib/prisma.js";
import {
  createLibraryItemSchema,
  updateLibraryItemSchema,
} from "../schemas/library-item.schema.js";

const router = Router();

router.post("/", async (req, res) => {
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

router.get("/", async (req, res) => {
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
      include: {
        category: true,
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

router.get("/:id", async (req, res) => {
  try {
    const libraryItem = await prisma.libraryItem.findUnique({
      where: {
        id: req.params.id,
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

router.put("/:id", async (req, res) => {
  try {
    const result = updateLibraryItemSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Ogiltigt library item.",
        errors: result.error.flatten(),
      });
    }

    const libraryItem = await prisma.libraryItem.update({
      where: {
        id: req.params.id,
      },
      data: result.data,
    });

    res.json(libraryItem);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        message: "Library item kunde inte hittas.",
      });
    }

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
      message: "Kunde inte uppdatera library item.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const libraryItem = await prisma.libraryItem.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!libraryItem) {
      return res.status(404).json({
        message: "Biblioteksposten kunde inte hittas.",
      });
    }

    if (libraryItem.borrower || libraryItem.borrowDate) {
      return res.status(409).json({
        message:
          "Boken kan inte tas bort eftersom den är utlånad. Registrera återlämningen först.",
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

      await tx.libraryItem.delete({
        where: {
          id: req.params.id,
        },
      });
    });

    return res.status(204).send();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Kunde inte ta bort biblioteksposten.",
    });
  }
});

export default router;
