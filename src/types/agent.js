"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstraintSchema = exports.AgentRoleSchema = void 0;
var zod_1 = require("zod");
// --- Schemas for I/O ---
exports.AgentRoleSchema = zod_1.z.enum(['planner', 'implementer', 'reviewer']);
exports.ConstraintSchema = zod_1.z.object({
    type: zod_1.z.enum(['NO_NEW_DEPENDENCIES', 'USE_EXISTING_PATTERN', 'SECURITY', 'PERFORMANCE']),
    description: zod_1.z.string(),
    enforcementLevel: zod_1.z.enum(['required', 'preferred', 'suggestion']),
});
