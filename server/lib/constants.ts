export const server_port = 3123;

const fs = require("fs");

function isRunningInDocker() {
  try {
    return fs.existsSync("/.dockerenv");
  } catch (e) {
    return false;
  }
}


export const RESET_CHROMA_ON_START = true;
export const isDocker = isRunningInDocker();
export const network_url = isDocker ? "host.docker.internal" : "localhost";
export const chroma_url = isDocker ? "chroma-server" : "localhost";

export const MAX_RETRIES = 6;

export const colors = [
  "orange",
  "cyan",
  "beige",
  "salmon",
  "white",
  "lime",
  "pink",
  "indigo",
  "magenta",
  "gold",
  "brown",
  "yellow",
  "blue",
  "purple",
];

export const WORLD_STATE_COLLECTION_NAME = "world";
export const ACTIONS_COLLECTION_NAME = "actions";

export const MAX_RESPONSE_TOKENS = 400;
