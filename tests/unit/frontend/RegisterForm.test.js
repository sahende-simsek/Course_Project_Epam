"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const RegisterForm_1 = __importDefault(require("../../../src/frontend/components/RegisterForm"));
describe('RegisterForm', () => {
    test('renders inputs and submit', () => {
        (0, react_2.render)(<RegisterForm_1.default />);
        expect(react_2.screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(react_2.screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(react_2.screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });
});
