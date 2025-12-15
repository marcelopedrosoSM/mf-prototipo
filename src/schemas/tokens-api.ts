import { z } from 'zod';

export const tokenApiSchema = z.object({
  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .trim()
    .min(1, 'Título é obrigatório'),
  expiresAt: z.string().trim().optional(),
  permissionIds: z.array(z.number()).min(0),
});

export type TokenApiFormData = z.infer<typeof tokenApiSchema>;

