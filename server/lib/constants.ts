export const server_port = 3123;

const fs = require("fs");

function isRunningInDocker() {
  try {
    return fs.existsSync("/.dockerenv");
  } catch (e) {
    return false;
  }
}


export const RESET_CHROMA_ON_START = false;
export const isDocker = isRunningInDocker();
export const network_url = isDocker ? "host.docker.internal" : "localhost";

export const MAX_RETRIES = 6;

export const colors = [
  "rgba(255, 102, 51, 0.9)",
  "rgba(255, 51, 255, 0.9)",
  "rgba(255, 255, 153, 0.9)",
  "rgba(0, 179, 230, 0.9)",
  "rgba(230, 179, 51, 0.9)",
  "rgba(51, 102, 230, 0.9)",
  "rgba(153, 153, 102, 0.9)",
  "rgba(153, 255, 153, 0.9)",
  "rgba(179, 77, 77, 0.9)",
  "rgba(175, 179, 153, 0.9)",
];

export const WORLD_STATE_COLLECTION_NAME = "world";
export const ACTIONS_COLLECTION_NAME = "actions";

export const MAX_RESPONSE_TOKENS = 400;
