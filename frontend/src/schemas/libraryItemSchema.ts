import { z } from "zod";

const isbnSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "")
  .refine(
    (isbn) => {
      isbn = isbn.replace(/[\s-]/g, "");
      if (isbn === "") {
        return true;
      }

      if (/^\d{9}[\dX]$/.test(isbn)) {
        const total = [...isbn].reduce((sum, digit, index) => {
          const value = digit === "X" ? 10 : Number(digit);
          return sum + value * (10 - index);
        }, 0);

        return total % 11 === 0;
      }

      if (/^\d{13}$/.test(isbn)) {
        const total = [...isbn].slice(0, 12).reduce((sum, digit, index) => {
          return sum + Number(digit) * (index % 2 === 0 ? 1 : 3);
        }, 0);

        const checkDigit = (10 - (total % 10)) % 10;

        return checkDigit === Number(isbn[12]);
      }

      return false;
    },
    {
      message:
        "Ange ett giltigt ISBN-10 eller ISBN-13. Du kan använda bindestreck och mellanslag.",
    },
  );

const baseLibraryItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Titel krävs.")
    .max(200, "Titeln får vara högst 200 tecken."),

  categoryId: z.string().min(1, "Kategori krävs."),

  isBorrowable: z.boolean(),
});

const bookSchema = baseLibraryItemSchema.extend({
  type: z.literal("BOOK"),

  author: z.string().trim().min(1, "Författare krävs."),

  isbn: isbnSchema,

  nbrPages: z.number().int().positive("Antal sidor måste vara större än 0."),
});

const dvdSchema = baseLibraryItemSchema.extend({
  type: z.literal("DVD"),

  runTimeMinutes: z.number().int().positive("Speltid måste vara större än 0."),
});

const audiobookSchema = baseLibraryItemSchema.extend({
  type: z.literal("AUDIOBOOK"),

  runTimeMinutes: z.number().int().positive("Speltid måste vara större än 0."),
});

const referenceBookSchema = baseLibraryItemSchema.extend({
  type: z.literal("REFERENCE_BOOK"),

  author: z.string().trim().min(1, "Författare krävs."),

  isbn: isbnSchema,

  nbrPages: z.number().int().positive("Antal sidor måste vara större än 0."),

  isBorrowable: z.literal(false),
});

export const libraryItemSchema = z.discriminatedUnion("type", [
  bookSchema,
  dvdSchema,
  audiobookSchema,
  referenceBookSchema,
]);
