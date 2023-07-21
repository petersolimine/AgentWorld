import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import ngrok from "ngrok";
import blessed from "blessed";
import { network_url, MAX_RETRIES } from "../server/lib/constants";
import config from "./config.json";

const app: Express = express();
const port: number = config.port;

app.use(bodyParser.json());

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

// Create a box for user input.
var inputBox = blessed.textbox({
  top: "70%", // changed from 80%
  left: "center",
  width: "90%",
  height: "30%", // changed from 20%
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "#f0f0f0",
    },
  },
});

// Set label to indicate user input.
inputBox.setLabel({ text: "Enter your action here", side: "left" });

// Create a box for countdown.
var countdownBox = blessed.textbox({
  top: "0",
  left: "center",
  width: "90%",
  height: "70%", // changed from 80%
  content: "",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "#f0f0f0",
    },
  },
});

screen.append(inputBox);
screen.append(countdownBox);
screen.render();

// Quit on Ctrl+C.
screen.key(["C-c"], () => {
  process.exit(0);
});

app.post("/chat/", async (req: Request, res: Response) => {
  console.log("Message Received from Game Engine:", req.body.actionRequest);

  let countdown = req.body.timeout / 1000;
  const interval = setInterval(() => {
    countdownBox.setContent(`Time remaining: ${countdown}s`);
    screen.render();
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      res
        .status(200)
        .json({ action: "No action was given in the allowed time." });
    }
  }, 1000);

  inputBox.focus();
  inputBox.readInput();
  screen.render();
  screen.remove(inputBox);
  screen.append(inputBox);

  const text = inputBox.getValue();

  inputBox.on("submit", (text) => {
    if (text) {
      clearInterval(interval);
      res.status(200).json({ action: text });
      screen.render();
      screen.remove(inputBox);
      screen.append(inputBox);
    }
    inputBox.clearValue();
    inputBox.focus(); // Maintain focus after submission
  });

  inputBox.key("enter", () => {
    inputBox.submit();
  });
});

try {
  app.listen(port, () => console.log(`Agent listening on port ${port}!`));
} catch (e: any) {
  if (e.code === "EADDRINUSE") {
    console.log(
      `Port ${port} is in use, edit the value of "port" in config.json and retry.`
    );
  } else {
    console.log(e);
  }
}

const serverUrl: string = config.server_url;
let retries = 0;

const joinServer = (chatUrl: string) => {
  axios
    .post(`${serverUrl}/join`, {
      name: config.character_name,
      url: chatUrl,
    })
    .then((res) => console.log(res.data))
    .catch((error) => {
      console.error(
        `Failed to join server: ${
          error.response && error.response.data
            ? error.response.data.error
            : error
        }`
      );

      if (retries < MAX_RETRIES) {
        retries++;
        setTimeout(() => joinServer(chatUrl), 10000); // Retry after 10 seconds
      }
    });
};

(async () => {
  let url;
  if (config.external_server) {
    url = await ngrok.connect(port);
  } else {
    url = `http://${network_url}:${port}`;
  }
  console.log("agent URL:", url);
  joinServer(`${url}/chat/`);
})();
