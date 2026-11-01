import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Namn krävs.")
    .max(100, "Namnet får vara högst 100 tecken."),

  email: z
    .string()
    .trim()
    .email("Ange en giltig e-postadress.")
    .max(255, "E-postadressen får vara högst 255 tecken."),
});
