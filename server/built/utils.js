"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatActionsToString = void 0;
function formatActionsToString(actionsArray) {
    return actionsArray.map((item) => `${item.user}: ${item.action}`).join("\n");
}
exports.formatActionsToString = formatActionsToString;
