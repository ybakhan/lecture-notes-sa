
import { SERVICE_HOST, PORT } from './config';

export const questionAI = (transcriptionID, question) => {
  const url = `http://${SERVICE_HOST}:${PORT}/question`;
  const data = {
    tid: transcriptionID,
    question: question,
  };

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json()
  })
  .catch(error => {
    console.error('Error:', error);
    return Promise.reject(error);
  });
}