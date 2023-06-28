export const server_port = 3123;

const fs = require("fs");

function isRunningInDocker() {
  try {
    return fs.existsSync("/.dockerenv");
  } catch (e) {
    return false;
  }
}

export const isDocker = isRunningInDocker();
export const network_url = isDocker ? "host.docker.internal" : "localhost";

export const MAX_RETRIES = 6;
