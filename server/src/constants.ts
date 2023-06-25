export const server_port = 3123;

const fs = require("fs");

function isRunningInDocker() {
  try {
    return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker");
  } catch (e) {
    return false;
  }
}

export let server_host = "localhost";

if (isRunningInDocker()) {
  server_host = "world";
}
