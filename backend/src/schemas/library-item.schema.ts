import { z } from "zod";

const baseLibraryItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Titel krävs.")
    .max(200, "Titeln får vara högst 200 tecken."),

  categoryId: z.string().min(1, "Kategori krävs."),

  imageUrl: z.string().url("Bildens URL är ogiltig.").optional(),

  isBorrowable: z.boolean(),
});

export const createBookSchema = baseLibraryItemSchema.extend({
  type: z.literal("BOOK"),

  author: z.string().trim().min(1, "Författare krävs."),

  nbrPages: z.number().int().positive("Antal sidor måste vara större än 0."),
});

export const createDvdSchema = baseLibraryItemSchema.extend({
  type: z.literal("DVD"),

  runTimeMinutes: z.number().int().positive("Speltid måste vara större än 0."),
});

export const createAudiobookSchema = baseLibraryItemSchema.extend({
  type: z.literal("AUDIOBOOK"),

  runTimeMinutes: z.number().int().positive("Speltid måste vara större än 0."),
});

export const createReferenceBookSchema = baseLibraryItemSchema.extend({
  type: z.literal("REFERENCE_BOOK"),

  author: z.string().trim().min(1, "Författare krävs."),

  nbrPages: z.number().int().positive("Antal sidor måste vara större än 0."),

  isBorrowable: z.literal(false),
});

export const createLibraryItemSchema = z.discriminatedUnion("type", [
  createBookSchema,
  createDvdSchema,
  createAudiobookSchema,
  createReferenceBookSchema,
]);

export const updateLibraryItemSchema = createLibraryItemSchema;
