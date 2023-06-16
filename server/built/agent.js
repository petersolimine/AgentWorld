"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3111;
app.use(body_parser_1.default.json());
app.post("/chat/", (_, res) => {
    res.status(200).json({ action: "for my turn, I forfeit" });
});
app.listen(port, () => console.log(`Agent listening on port ${port}!`));
const serverUrl = "http://localhost:3123";
axios_1.default
    .post(`${serverUrl}/join`, {
    name: "Agent1",
    url: `http://localhost:${port}/chat/`,
})
    .then((res) => console.log(res.data))
    .catch((error) => console.error(`Failed to join server: ${error.response && error.response.data
    ? error.response.data.error
    : error}`));
