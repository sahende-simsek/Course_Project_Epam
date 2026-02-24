"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDb = exports.clearDb = void 0;
const prismaClient_1 = __importDefault(require("../../src/auth/infra/prismaClient"));
async function clearDb() {
    // Clear tables used by auth feature. Adjust if more models are added.
    // Order matters for FK constraints.
    try {
        await prismaClient_1.default.refreshToken.deleteMany();
    }
    catch (e) {
        // ignore if table doesn't exist in some test setups
    }
    try {
        await prismaClient_1.default.user.deleteMany();
    }
    catch (e) {
        // ignore
    }
}
exports.clearDb = clearDb;
async function disconnectDb() {
    await prismaClient_1.default.$disconnect();
}
exports.disconnectDb = disconnectDb;
exports.default = { clearDb, disconnectDb };
