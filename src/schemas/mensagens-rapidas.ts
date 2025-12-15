import { z } from 'zod';

const minLength = 2;
const titleMaxLength = 160;
const contentMaxLength = 2000;

export const mensagemRapidaSchema = z.object({
  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .trim()
    .min(minLength, 'Título deve ter no mínimo 2 caracteres')
    .max(titleMaxLength, `Título deve ter no máximo ${titleMaxLength} caracteres`),
  content: z
    .string({
      required_error: 'Conteúdo é obrigatório',
    })
    .trim()
    .min(minLength, 'Conteúdo deve ter no mínimo 2 caracteres')
    .max(contentMaxLength, `Conteúdo deve ter no máximo ${contentMaxLength} caracteres`),
});

export type MensagemRapidaFormData = z.infer<typeof mensagemRapidaSchema>;

