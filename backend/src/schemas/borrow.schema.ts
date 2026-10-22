import { z } from "zod";

export const borrowLibraryItemSchema = z.object({
  borrower: z
    .string()
    .trim()
    .min(1, "Låntagare krävs.")
    .max(100, "Låntagarens namn får vara högst 100 tecken."),
});
