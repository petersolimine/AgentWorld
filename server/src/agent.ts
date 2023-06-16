import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app: Express = express();
const port: number = 3111;

app.use(bodyParser.json());

app.post("/chat/", (_: Request, res: Response) => {
  res.status(200).json({ action: "for my turn, I forfeit" });
});

app.listen(port, () => console.log(`Agent listening on port ${port}!`));

const serverUrl: string = "http://localhost:3123";

axios
  .post(`${serverUrl}/join`, {
    name: "Agent1",
    url: `http://localhost:${port}/chat/`,
  })
  .then((res) => console.log(res.data))
  .catch((error) =>
    console.error(
      `Failed to join server: ${
        error.response && error.response.data
          ? error.response.data.error
          : error
      }`
    )
  );
