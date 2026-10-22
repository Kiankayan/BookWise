import { Router } from "express";
import { prisma, Prisma } from "../lib/prisma.js";
import { createCategorySchema } from "../schemas/category.schema.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(categories);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte hämta kategorier.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Ogiltig kategori.",
        errors: result.error.flatten(),
      });
    }

    const category = await prisma.category.create({
      data: {
        name: result.data.name,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        message: "En kategori med det namnet finns redan.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Kunde inte skapa kategori.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const result = createCategorySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Ogiltig kategori.",
        errors: result.error.flatten(),
      });
    }

    const category = await prisma.category.update({
      where: {
        id: req.params.id,
      },
      data: {
        name: result.data.name,
      },
    });

    res.json(category);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "En kategori med det namnet finns redan.",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Kategorin kunde inte hittas.",
        });
      }
    }

    console.error(error);

    res.status(500).json({
      message: "Kunde inte uppdatera kategori.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        libraryItems: true,
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Kategorin kunde inte hittas.",
      });
    }

    if (category.libraryItems.length > 0) {
      return res.status(409).json({
        message:
          "Kategorin kan inte tas bort eftersom den används av library items.",
      });
    }

    await prisma.category.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kunde inte ta bort kategori.",
    });
  }
});

export default router;
