import { z } from 'zod';

export const timeSchema = z.object({
  name: z
    .string({
      required_error: 'Nome obrigatório',
    })
    .trim()
    .min(1, 'Nome obrigatório'),
  users: z.array(z.string()).optional(),
});

export type TimeFormData = z.infer<typeof timeSchema>;

