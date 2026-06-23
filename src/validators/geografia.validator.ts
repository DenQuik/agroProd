import { z } from 'zod';

export const getMunicipiosSchema = z.object({
  estadoId: z.coerce.number().int().positive('estadoId debe ser un entero positivo'),
});

export const getParroquiasSchema = z.object({
  municipioId: z.coerce.number().int().positive('municipioId debe ser un entero positivo'),
});

export type GetMunicipiosParams = z.infer<typeof getMunicipiosSchema>;
export type GetParroquiasParams = z.infer<typeof getParroquiasSchema>;
