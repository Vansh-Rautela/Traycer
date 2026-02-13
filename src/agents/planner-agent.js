"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlannerAgent = void 0;
var zod_1 = require("zod");
var uuid_1 = require("uuid"); // You need to install uuid: npm install uuid @types/uuid
var base_agent_1 = require("./base-agent");
var plan_1 = require("../types/plan");
var planner_prompts_1 = require("./prompts/planner-prompts");
// The LLM output schema is a subset of the full PlanSchema
// We don't ask the LLM for IDs or Dates to avoid hallucinations/inconsistencies
var PlannerOutputSchema = zod_1.z.object({
    intent: zod_1.z.string(),
    phases: zod_1.z.array(plan_1.PhaseSchema.omit({ dependencies: true })
        .extend({ dependencies: zod_1.z.array(zod_1.z.string()).optional() })), // Optional in input, standardized in output
    metadata: plan_1.PlanMetadataSchema.omit({ provider: true, model: true }), // System fills these
});
var PlannerAgent = /** @class */ (function (_super) {
    __extends(PlannerAgent, _super);
    function PlannerAgent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.role = 'planner';
        return _this;
    }
    PlannerAgent.prototype.getSystemPrompt = function () {
        return planner_prompts_1.PLANNER_SYSTEM_PROMPT;
    };
    PlannerAgent.prototype.getUserPrompt = function (request) {
        // Extract file list from context for the prompt
        var fileList = request.context.projectFiles.map(function (f) { return f.path; });
        return (0, planner_prompts_1.PLANNER_USER_PROMPT)(request.context.architecture.structure[0] || "New Project", fileList);
        // Note: In real usage, we pass the actual intent string differently or embedded in context.
        // For V1, let's assume 'intent' is passed via a specialized request property 
        // or we'll define a specialized PlannerRequest type.
    };
    // To properly support the specific signature for prompts, we might need to override invoke 
    // or adjust the prompt generation. For strict adherence to BaseAgent, we assume 
    // 'intent' is passed in the request.context or similar.
    // CORRECT APPROACH: We will create a specialized method for the public API.
    PlannerAgent.prototype.getResponseSchema = function () {
        return PlannerOutputSchema;
    };
    /**
     * Specialized entry point for the Planner
     */
    PlannerAgent.prototype.generatePlan = function (intent, context) {
        return __awaiter(this, void 0, void 0, function () {
            var userPrompt, request, augmentedContext, response, output, planId, now, fullPlan;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userPrompt = (0, planner_prompts_1.PLANNER_USER_PROMPT)(intent, context.projectFiles.map(function (f) { return f.path; }));
                        request = {
                            context: __assign(__assign({}, context), { architecture: __assign(__assign({}, context.architecture), { structure: [intent] }) }), // Hack: passing intent in structure for now, or we extend AgentContext
                            temperature: 0.2,
                            maxTokens: 4000
                        };
                        augmentedContext = __assign(__assign({}, context), { existingCode: __assign(__assign({}, context.existingCode), { '__INTENT__': intent }) });
                        return [4 /*yield*/, this.invoke(__assign(__assign({}, request), { context: augmentedContext }))];
                    case 1:
                        response = _a.sent();
                        output = response.content;
                        planId = (0, uuid_1.v4)();
                        now = new Date().toISOString();
                        fullPlan = {
                            id: planId,
                            createdAt: now,
                            updatedAt: now,
                            intent: output.intent,
                            phases: output.phases.map(function (p, index) { return (__assign(__assign({}, p), { 
                                // Ensure dependencies are sequential if not provided
                                dependencies: p.dependencies || (index > 0 ? ["phase-".concat(index)] : []), 
                                // Ensure IDs are normalized
                                id: p.id || "phase-".concat(index + 1) })); }),
                            metadata: __assign(__assign({}, output.metadata), { provider: this.provider.name, model: response.model })
                        };
                        return [2 /*return*/, fullPlan];
                }
            });
        });
    };
    // Implementation of abstract method for BaseAgent
    PlannerAgent.prototype.getUserPrompt = function (request) {
        var intent = request.context.existingCode['__INTENT__'] || 'No intent provided';
        var fileList = request.context.projectFiles.map(function (f) { return f.path; });
        return (0, planner_prompts_1.PLANNER_USER_PROMPT)(intent, fileList);
    };
    return PlannerAgent;
}(base_agent_1.BaseAgent));
exports.PlannerAgent = PlannerAgent;
