import { z } from 'zod';

// --- Zod Schemas ---

export const CodeLocationSchema = z.object({
  line: z.number().int().min(1),
  column: z.number().int().min(1),
});

export const ViolationTypeSchema = z.enum([
  'HALLUCINATED_FUNCTION',
  'INVALID_IMPORT',
  'TYPE_ERROR',
  'MISSING_DECLARATION',
]);

export const ViolationDetailsSchema = z.object({
  expected: z.string().optional(),
  actual: z.string().optional(),
  suggestion: z.string().optional(),
});

export const ViolationSchema = z.object({
  type: ViolationTypeSchema,
  message: z.string(),
  location: CodeLocationSchema,
  details: ViolationDetailsSchema.optional(),
  file: z.string(),
});

export const FileVerificationSchema = z.object({
  path: z.string(),
  violations: z.array(ViolationSchema),
  passed: z.boolean(),
});

export const VerificationReportSchema = z.object({
  timestamp: z.string().datetime(),
  files: z.array(FileVerificationSchema),
  summary: z.object({
    totalFiles: z.number(),
    totalViolations: z.number(),
    passed: z.boolean(),
  }),
});

// --- TypeScript Interfaces ---

export type ViolationType = z.infer<typeof ViolationTypeSchema>;
export type CodeLocation = z.infer<typeof CodeLocationSchema>;
export type Violation = z.infer<typeof ViolationSchema>;
export type FileVerification = z.infer<typeof FileVerificationSchema>;
export type VerificationReport = z.infer<typeof VerificationReportSchema>;
