"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tokens_1 = __importDefault(require("../../../src/frontend/theme/tokens"));
describe('theme tokens', () => {
    test('exports expected keys', () => {
        expect(tokens_1.default).toHaveProperty('colors');
        expect(tokens_1.default).toHaveProperty('spacing');
        expect(tokens_1.default).toHaveProperty('typography');
    });
    test('colors contain primary and text', () => {
        expect(tokens_1.default.colors).toHaveProperty('primary');
        expect(tokens_1.default.colors).toHaveProperty('text');
    });
});
