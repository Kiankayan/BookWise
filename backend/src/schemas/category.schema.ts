import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Kategorinamn krävs.")
    .max(100, "Kategorinamnet får vara högst 100 tecken."),
});
