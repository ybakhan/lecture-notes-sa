import { SERVICE_HOST, PORT } from './config';

export const transcription = {
    id: ""
};

export const createSocket = () => {
  const socket = new WebSocket(`ws://${SERVICE_HOST}:${PORT}/ws`);
  
  socket.onopen = function() {
      console.log("Connected to the server");
  };

  socket.onclose = function() {
    console.log("Disconnected from the server");
  };

  socket.onerror = function(error) {
      console.error("WebSocket error:", error);
  };

  socket.onmessage = function(event) {
      console.log("Received message:", event.data);
      const message = JSON.parse(event.data);
      if (message.fileName) {
        transcription.id = message.fileName;
        socket.close();
      }
  };
  return socket;
}

export const sendMessage = (socket, message) => {
  const payload = {
    data: btoa(message),
  };
  const jsonstr = JSON.stringify(payload);
  console.log(`sending message: ${jsonstr}`);
  socket.send(jsonstr);
};

export const sendEndMessage = (socket) => {
  const payload = {
    type: "end",
    timestamp: new Date().toISOString()
  };
  socket.send(JSON.stringify(payload));
}
