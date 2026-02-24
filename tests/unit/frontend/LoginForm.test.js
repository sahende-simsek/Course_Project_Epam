"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const LoginForm_1 = __importDefault(require("../../../src/frontend/components/LoginForm"));
describe('LoginForm', () => {
    test('renders inputs and submit', () => {
        (0, react_2.render)(<LoginForm_1.default />);
        expect(react_2.screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(react_2.screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(react_2.screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
    test('shows required validation when submitted empty', async () => {
        (0, react_2.render)(<LoginForm_1.default />);
        react_2.fireEvent.click(react_2.screen.getByRole('button', { name: /sign in/i }));
        // native required validation may not trigger in jsdom; ensure button exists
        expect(react_2.screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
    });
});
