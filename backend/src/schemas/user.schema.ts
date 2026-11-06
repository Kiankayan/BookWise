import { z } from "zod";

export const registerUserSchema = z.object({
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

  password: z
    .string()
    .min(8, "Lösenordet måste innehålla minst 8 tecken.")
    .max(72, "Lösenordet får vara högst 72 tecken."),
});

export const loginUserSchema = z.object({
  email: z.string().trim().email("Ange en giltig e-postadress."),

  password: z.string().min(1, "Lösenord krävs."),

  rememberMe: z.boolean().default(false),
});
