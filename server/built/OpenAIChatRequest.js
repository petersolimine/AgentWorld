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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIRequest = void 0;
function OpenAIRequest(payload) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("https://api.openai.com/v1/chat/completions", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${(_a = process.env.OPENAI_API_KEY) !== null && _a !== void 0 ? _a : ""}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            // convert the res to a string and return the error
            console.log(res);
            return res.text();
            throw new Error("Error in OpenAI API request");
        }
        const data = yield res.json();
        console.log(data);
        const text = data.choices[0].message.content;
        console.log(data.choices[0].message.content);
        return text;
    });
}
exports.OpenAIRequest = OpenAIRequest;
