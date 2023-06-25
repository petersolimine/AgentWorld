"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server_host = exports.server_port = void 0;
exports.server_port = 3123;
const fs = require("fs");
function isRunningInDocker() {
    try {
        return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
    }
    catch (e) {
        return false;
    }
}
exports.server_host = "localhost";
if (isRunningInDocker()) {
    exports.server_host = "world";
}
