import { z } from 'zod';

export const caixaEntradaSchema = z.object({
  name: z
    .string({
      required_error: 'Nome obrigatório',
    })
    .trim()
    .min(1, 'Nome obrigatório'),
  phoneNumber: z
    .string()
    .refine((doc) => {
      if (!doc || doc.length === 0) return true;
      const replacedDoc = doc.replace(/\D/g, '');
      return replacedDoc.length >= 13;
    }, 'Telefone inválido')
    .optional(),
  phoneNumberId: z
    .string()
    .trim()
    .min(1, 'ID do número de telefone obrigatório')
    .optional(),
  apiKey: z
    .string()
    .trim()
    .min(1, 'Chave da API obrigatória')
    .optional(),
  businessAccountId: z
    .string()
    .trim()
    .min(1, 'ID da conta de negócios obrigatório')
    .optional(),
});

export type CaixaEntradaFormData = z.infer<typeof caixaEntradaSchema>;

