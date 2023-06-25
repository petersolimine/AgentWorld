"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.network_url = exports.isDocker = exports.server_port = void 0;
exports.server_port = 3123;
const fs = require("fs");
function isRunningInDocker() {
    try {
        return fs.existsSync("/.dockerenv");
    }
    catch (e) {
        return false;
    }
}
exports.isDocker = isRunningInDocker();
exports.network_url = exports.isDocker ? "host.docker.internal" : "localhost";
