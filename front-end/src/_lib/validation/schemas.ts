import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Email inválido").max(255),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128),
})

export const registerSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50).trim(),
    username: z
        .string()
        .min(3, "Usuário deve ter no mínimo 3 caracteres")
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, "Usuário só pode conter letras, números e _")
        .trim(),
    email: z.string().email("Email inválido").max(255),
    password: z
        .string()
        .min(8, "Senha deve ter no mínimo 8 caracteres")
        .max(128)
        .regex(/[A-Z]/, "Senha deve ter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "Senha deve ter ao menos um número"),
})

export const chatMessageSchema = z.object({
    message: z.string().min(1).max(4000).trim(),
    agent: z.enum(["lucy", "jouli", "ricki"]),
    sessionId: z.string().cuid().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>