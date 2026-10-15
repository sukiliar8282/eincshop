import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid.")
    .max(254)
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Hanya email resmi @gmail.com yang diizinkan untuk mendaftar.",
    }),
  password: z.string().min(8, "Password minimal 8 karakter.").max(128),
});

export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
