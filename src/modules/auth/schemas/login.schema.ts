import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email address is required." })
        .email({ message: "Please enter a valid email address." }),
    password: z
        .string()
        .min(6, { message: "The password must be at least 6 characters long." }),
});

// Tipo inferido para react-hook-form
export type LoginFormValues = z.infer<typeof loginSchema>;