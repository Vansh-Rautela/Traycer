"use strict";
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
exports.StateManager = void 0;
var path_1 = require("path");
var promises_1 = require("fs/promises");
var atomic_writer_1 = require("./atomic-writer");
var state_1 = require("../types/state");
var error_1 = require("../utils/error");
var BACKUP_LIMIT = 5;
var StateManager = /** @class */ (function () {
    function StateManager(rootDir) {
        this.statePath = path_1.default.join(rootDir, '.traylite', 'state.json');
        this.backupDir = path_1.default.join(rootDir, '.traylite', 'backups');
        this.writer = new atomic_writer_1.AtomicWriter();
    }
    StateManager.prototype.loadState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writer.readJSON(this.statePath)];
                    case 1:
                        data = _a.sent();
                        if (!data) {
                            return [2 /*return*/, this.createDefaultState()];
                        }
                        result = state_1.ExecutionStateSchema.safeParse(data);
                        if (!result.success) {
                            throw new error_1.StorageError('State file corrupted or invalid schema', {
                                zodErrors: result.error.errors
                            });
                        }
                        return [2 /*return*/, result.data];
                }
            });
        });
    };
    StateManager.prototype.saveState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var result, updatedState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = state_1.ExecutionStateSchema.safeParse(state);
                        if (!result.success) {
                            throw new error_1.StorageError('Attempted to save invalid state', {
                                zodErrors: result.error.errors
                            });
                        }
                        // 2. Create backup of current state if it exists
                        return [4 /*yield*/, this.createBackup()];
                    case 1:
                        // 2. Create backup of current state if it exists
                        _a.sent();
                        updatedState = __assign(__assign({}, state), { updatedAt: new Date().toISOString() });
                        // 4. Atomic write
                        return [4 /*yield*/, this.writer.writeJSON(this.statePath, updatedState)];
                    case 2:
                        // 4. Atomic write
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.resetState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.saveState(this.createDefaultState())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.createDefaultState = function () {
        return {
            planId: null,
            status: 'idle',
            currentPhase: null,
            completedPhases: [],
            failedPhases: [],
            startedAt: null,
            updatedAt: new Date().toISOString(),
            completedAt: null
        };
    };
    StateManager.prototype.createBackup = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exists, timestamp, backupPath, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.writer.exists(this.statePath)];
                    case 1:
                        exists = _a.sent();
                        if (!exists)
                            return [2 /*return*/];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, promises_1.default.mkdir(this.backupDir, { recursive: true })];
                    case 3:
                        _a.sent();
                        timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        backupPath = path_1.default.join(this.backupDir, "state-".concat(timestamp, ".json"));
                        return [4 /*yield*/, this.writer.readJSON(this.statePath)];
                    case 4:
                        data = _a.sent();
                        return [4 /*yield*/, this.writer.writeJSON(backupPath, data)];
                    case 5:
                        _a.sent();
                        // Rotate backups
                        return [4 /*yield*/, this.rotateBackups()];
                    case 6:
                        // Rotate backups
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        // Backup failure should not block main execution, but we should log it
                        console.warn('Failed to create state backup:', error_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    StateManager.prototype.rotateBackups = function () {
        return __awaiter(this, void 0, void 0, function () {
            var files, backups, toDelete, _i, toDelete_1, file;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, promises_1.default.readdir(this.backupDir)];
                    case 1:
                        files = _a.sent();
                        backups = files.filter(function (f) { return f.startsWith('state-') && f.endsWith('.json'); });
                        if (backups.length <= BACKUP_LIMIT)
                            return [2 /*return*/];
                        // Sort by name (which contains timestamp) ascending
                        backups.sort();
                        toDelete = backups.slice(0, backups.length - BACKUP_LIMIT);
                        _i = 0, toDelete_1 = toDelete;
                        _a.label = 2;
                    case 2:
                        if (!(_i < toDelete_1.length)) return [3 /*break*/, 5];
                        file = toDelete_1[_i];
                        return [4 /*yield*/, promises_1.default.unlink(path_1.default.join(this.backupDir, file))];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return StateManager;
}());
exports.StateManager = StateManager;
