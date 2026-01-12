import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña no puede tener más de 100 caracteres'),
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede tener más de 100 caracteres'),
});

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});