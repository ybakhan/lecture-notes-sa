import MicrophoneStream from 'microphone-stream';
import { SAMPLE_RATE } from './config';

export const createMicrophoneStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    const microphoneStream = new MicrophoneStream();
    microphoneStream.setStream(stream);
    return microphoneStream;
  } catch (error) {
    console.error('Error accessing microphone:', error);
    throw error;
  }
};

export const getAudioStream = async function* (microphoneStream) {
  for await (const chunk of microphoneStream) {
    if (chunk.length <= SAMPLE_RATE) {
      yield {
        AudioEvent: {
          AudioChunk: encodePCMChunk(chunk),
        },
      };
    }
  }
};

const encodePCMChunk = (chunk) => {
  const input = MicrophoneStream.toRaw(chunk);
  let offset = 0;
  const buffer = new ArrayBuffer(input.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return Buffer.from(buffer);
};