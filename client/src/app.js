import { sendEndMessage, createSocket, transcription } from './socket';
import { startStreaming, createTranscribeClient } from './transcribe-client';
import { createMicrophoneStream } from './microphone';
import { questionAI } from './question';

const transcriptionDiv = document.getElementById("transcription-div");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");

startButton.addEventListener("click", async () => {
  transcriptionDiv.innerText = "";
  startButton.disabled = true;
  stopButton.disabled = false;
  await startRecording((text) => {
    transcriptionDiv.innerText += text;
  });
});

stopButton.addEventListener("click", () => {
  stopRecording();
  stopButton.disabled = true;
  startButton.disabled = false;
  askButton.disabled = false;
});

let microphoneStream = undefined;
let socket = undefined;

const startRecording = async (callback) => {
  if (microphoneStream) {
    stopRecording();
  } else {
    createTranscribeClient()
      .then((client) => {
        createMicrophoneStream().then((stream) => {
          microphoneStream = stream;
          socket = createSocket();
          startStreaming(client, callback, microphoneStream, socket);
        })
      })
  }
};

const stopRecording = function () {
  if (microphoneStream) {
    microphoneStream.stop();
    microphoneStream.destroy();
    microphoneStream = undefined;

    sendEndMessage(socket);
  }
};

const askButton = document.getElementById("askButton");
askButton.addEventListener("click", () => {
  sendMessage();
});

const messageInput = document.getElementById("message-input");
messageInput.addEventListener("keydown", (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
      const message = messageInput.value;
      console.log(`question: ${message}`);

      questionAI(transcription.id, message)
      .then(jsonData => {
          const jsonResponse = JSON.stringify(jsonData);
          console.log(`OpenAI response: ${jsonResponse}`, jsonResponse);
          return jsonData;
      })
      .then(data => {
        const chatHistory = document.getElementById("chat-history");
        const userMessage = document.createElement("div");
        userMessage.classList.add("user-message");
        userMessage.innerText = message;
        chatHistory.appendChild(userMessage);
  
        const serverMessage = document.createElement("div");
        serverMessage.classList.add("server-message");
        serverMessage.innerText = data.result;
        chatHistory.appendChild(serverMessage);
  
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
        messageInput.value = ""; // Clear input field
      })
      .catch(error => console.error(error));
}