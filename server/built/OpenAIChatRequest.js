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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function OpenAIRequest(payload) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.post("https://api.openai.com/v1/chat/completions", payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${(_a = process.env.OPENAI_API_KEY) !== null && _a !== void 0 ? _a : ""}`,
                },
            });
            const data = res.data;
            const text = data.choices[0].message.content;
            console.log(text);
            return text;
        }
        catch (error) {
            const axiosError = error;
            // log the error response
            console.log(axiosError.response);
            // convert the response to a string and throw an error
            throw new Error(`Error in OpenAI API request: ${(_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data}`);
        }
    });
}
exports.OpenAIRequest = OpenAIRequest;
