import {
  TranscribedMessage,
  CloseFile,
  WriteFile,
  OpenFile,
} from "./transcribed-message";
import WebSocket from "ws";
import { SaveTranscription } from "./save-transcription";

export const HandleConnection = (
  ws: WebSocket,
  fileName: string,
  filePath: string,
) => {
  OpenFile(filePath)
    .then((file) => {
      const th = new TranscribeHandler(ws, fileName, filePath, file);
      ws.on("message", (message: string) => {
        th.handleMessage(message);
      });
      ws.on("close", th.handleClose);
    })
    .catch((error) => {
      console.error("Error opening file:", error);
    });
};

class TranscribeHandler {
  private ws: WebSocket;
  private fileName: string;
  private filePath: string;
  private file: number;

  constructor(ws: WebSocket, fileName: string, filePath: string, file: number) {
    this.ws = ws;
    this.fileName = fileName;
    this.filePath = filePath;
    this.file = file;
  }

  handleMessage(message: string) {
    try {
      const payload: TranscribedMessage = JSON.parse(message);
      if (payload.type !== "end") {
        const transcribedMessage: string = decodeBase64(payload.data);
        console.log(
          `[transcribe-handler] Received message: ${transcribedMessage}`,
        );
        WriteFile(this.file, transcribedMessage);
      } else {
        console.log(
          `[transcribe-handler] sending fileName ${this.fileName} to client`,
        );
        this.ws.send(JSON.stringify({ fileName: this.fileName }));
      }
    } catch (error) {
      console.error(
        `[transcribe-handler] Error handling message: ${message}`,
        error,
      );
    }
  }

  handleClose = () => {
    console.log("[transcribe-handler] Client disconnected");
    CloseFile(this.file);

    SaveTranscription(this.fileName, this.filePath);
    // Delete local file
  };
}

function decodeBase64(base64String: string): string {
  const buffer = Buffer.from(base64String, "base64");
  return buffer.toString("utf-8");
}
