"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionStateSchema = exports.PhaseFailureSchema = exports.ErrorInfoSchema = exports.ExecutionStatusSchema = void 0;
var zod_1 = require("zod");
// --- Zod Schemas ---
exports.ExecutionStatusSchema = zod_1.z.enum([
    'idle',
    'planning',
    'executing',
    'paused',
    'complete',
    'failed',
]);
exports.ErrorInfoSchema = zod_1.z.object({
    code: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
    timestamp: zod_1.z.string().datetime(),
});
exports.PhaseFailureSchema = zod_1.z.object({
    phaseId: zod_1.z.string(),
    failedAt: zod_1.z.string().datetime(),
    error: exports.ErrorInfoSchema,
    retryCount: zod_1.z.number().int().nonnegative(),
});
exports.ExecutionStateSchema = zod_1.z.object({
    planId: zod_1.z.string().nullable(),
    status: exports.ExecutionStatusSchema,
    currentPhase: zod_1.z.string().nullable(),
    completedPhases: zod_1.z.array(zod_1.z.string()),
    failedPhases: zod_1.z.array(exports.PhaseFailureSchema),
    startedAt: zod_1.z.string().datetime().nullable(),
    updatedAt: zod_1.z.string().datetime(),
    completedAt: zod_1.z.string().datetime().nullable(),
});
