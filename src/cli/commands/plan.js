"use strict";
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
exports.PlanCommand = void 0;
var chalk_1 = require("chalk");
var ora_1 = require("ora");
var config_manager_1 = require("../../storage/config-manager");
var plan_store_1 = require("../../storage/plan-store");
var factory_1 = require("../../providers/llm/factory");
var planner_agent_1 = require("../../agents/planner-agent");
var PlanCommand = /** @class */ (function () {
    function PlanCommand() {
    }
    PlanCommand.prototype.register = function (program) {
        var _this = this;
        program
            .command('plan')
            .description('Generate an implementation plan from natural language intent')
            .argument('<intent>', 'Description of the feature to implement')
            .action(function (intent) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.execute(intent)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    PlanCommand.prototype.execute = function (intent) {
        return __awaiter(this, void 0, void 0, function () {
            var spinner, rootDir, configManager, config, provider, planner, planStore, context, plan, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        spinner = (0, ora_1.default)('Initializing Planner...').start();
                        rootDir = process.cwd();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        configManager = new config_manager_1.ConfigManager(rootDir);
                        return [4 /*yield*/, configManager.loadConfig()];
                    case 2:
                        config = _a.sent();
                        provider = factory_1.LLMProviderFactory.create(config.provider);
                        return [4 /*yield*/, provider.validateConfig()];
                    case 3:
                        _a.sent();
                        planner = new planner_agent_1.PlannerAgent(provider);
                        planStore = new plan_store_1.PlanStore(rootDir);
                        context = {
                            projectFiles: [],
                            existingCode: {},
                            architecture: {
                                dependencies: {},
                                projectType: 'typescript',
                                structure: [] // Populate with fs.readdir recursive if needed
                            }
                        };
                        spinner.text = 'Generating Plan (this may take 30s)...';
                        return [4 /*yield*/, planner.generatePlan(intent, context)];
                    case 4:
                        plan = _a.sent();
                        // 4. Save Plan
                        return [4 /*yield*/, planStore.savePlan(plan)];
                    case 5:
                        // 4. Save Plan
                        _a.sent();
                        spinner.succeed(chalk_1.default.green('Plan Generated Successfully!'));
                        console.log(chalk_1.default.cyan('\nPlan Summary:'));
                        console.log("ID: ".concat(plan.id));
                        console.log("Phases: ".concat(plan.phases.length));
                        plan.phases.forEach(function (phase) {
                            console.log(chalk_1.default.gray("- [".concat(phase.id, "] ").concat(phase.goal)));
                        });
                        console.log(chalk_1.default.yellow('\nRun `traylite execute` to start implementation.'));
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        spinner.fail('Plan Generation Failed');
                        console.error(chalk_1.default.red(error_1.message));
                        if (process.env.DEBUG)
                            console.error(error_1);
                        process.exit(1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return PlanCommand;
}());
exports.PlanCommand = PlanCommand;
