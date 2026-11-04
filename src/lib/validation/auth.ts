import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format.")
    .max(254)
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only official @gmail.com addresses are allowed.",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format.")
    .max(254)
    .refine((val) => val.endsWith("@gmail.com"), {
      message: "Only official @gmail.com addresses are allowed.",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
