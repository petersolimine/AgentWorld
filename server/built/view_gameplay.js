"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const ws = new ws_1.default("ws://localhost:8080");
ws.on("open", () => {
    console.log("Connected to the WebSocket server.");
});
ws.on("message", (message) => {
    console.log(`Received broadcasted message: ${message}`);
});
ws.on("error", (error) => {
    console.error(`WebSocket error: ${error.message}`);
});
ws.on("close", () => {
    console.log("Disconnected from the WebSocket server.");
});
