import { z } from 'zod';

export const codeGenerationSchema = z.object({
  quantity: z.number()
    .min(1, 'At least 1 code is required')
    .max(10000, 'Maximum 10,000 codes per batch'),
  brandPrefix: z.string().length(3, 'Brand prefix must be 3 characters'),
  productName: z.string().min(1, 'Product name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
  enableCustomSuccess: z.boolean(),
  customSuccessConfig: z.object({
    logoUrl: z.string().url('Invalid URL').optional(),
    companyName: z.string().optional(),
    productName: z.string().optional(),
    batchNumber: z.string().optional(),
    additionalFields: z.record(z.string(), z.string()).optional(),

  }).optional(),
});

export type CodeGenerationFormData = z.infer<typeof codeGenerationSchema>;