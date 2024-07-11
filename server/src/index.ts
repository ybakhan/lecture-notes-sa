import * as path from "path";
import { WebSocketServer, WebSocket } from "ws";
import bodyParser from "body-parser";
import cors from "cors";
import { HandleConnection } from "./transcribe/transcribe-handler";
import { HandlePostQuestion } from "./openai/question-handler";
import http from "http";
import express from "express";

const app = express();
const port = 8080;

app.use(cors());

app.get("/health", (_, res) => {
  res.status(200).json({ status: "healthy" });
});

// POST endpoint
app.post(
  "/question",
  bodyParser.json(), // Middleware to parse JSON
  HandlePostQuestion,
);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let seq: number = 0;
// websocket handler
wss.on("connection", (ws: WebSocket) => {
  // Format the timestamp as YYYYMMDD_HHMMSS
  const formattedTimestamp = new Date()
    .toISOString()
    .replace(/[-:T]/g, "")
    .split(".")[0];
  seq++;
  const fileName = `${formattedTimestamp}-${seq}.txt`;
  HandleConnection(ws, fileName, path.join(__dirname, fileName));
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
