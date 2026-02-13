"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationReportSchema = exports.FileVerificationSchema = exports.ViolationSchema = exports.ViolationDetailsSchema = exports.ViolationTypeSchema = exports.CodeLocationSchema = void 0;
var zod_1 = require("zod");
// --- Zod Schemas ---
exports.CodeLocationSchema = zod_1.z.object({
    line: zod_1.z.number().int().min(1),
    column: zod_1.z.number().int().min(1),
});
exports.ViolationTypeSchema = zod_1.z.enum([
    'HALLUCINATED_FUNCTION',
    'INVALID_IMPORT',
    'TYPE_ERROR',
    'MISSING_DECLARATION',
]);
exports.ViolationDetailsSchema = zod_1.z.object({
    expected: zod_1.z.string().optional(),
    actual: zod_1.z.string().optional(),
    suggestion: zod_1.z.string().optional(),
});
exports.ViolationSchema = zod_1.z.object({
    type: exports.ViolationTypeSchema,
    message: zod_1.z.string(),
    location: exports.CodeLocationSchema,
    details: exports.ViolationDetailsSchema.optional(),
    file: zod_1.z.string(),
});
exports.FileVerificationSchema = zod_1.z.object({
    path: zod_1.z.string(),
    violations: zod_1.z.array(exports.ViolationSchema),
    passed: zod_1.z.boolean(),
});
exports.VerificationReportSchema = zod_1.z.object({
    timestamp: zod_1.z.string().datetime(),
    files: zod_1.z.array(exports.FileVerificationSchema),
    summary: zod_1.z.object({
        totalFiles: zod_1.z.number(),
        totalViolations: zod_1.z.number(),
        passed: zod_1.z.boolean(),
    }),
});
