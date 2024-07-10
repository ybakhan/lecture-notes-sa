import { TranscribeStreamingClient, StartStreamTranscriptionCommand } from "@aws-sdk/client-transcribe-streaming";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { SAMPLE_RATE } from "./config";
import { getAudioStream } from './microphone';
import { sendMessage } from "./socket"; 
import CryptoJS from 'crypto-js';

const REGION = "us-east-2";
const language = "en-US";

const encryptedData = 'U2FsdGVkX19aI7v/s4TsmjrgcDGpSFry3F2Jhm4zFmRz3sPts81X6LRKmi55QWrr6l39ErojpWHszmraONSpdPHJk+OPhlT074huoEPBW+Nz2AjrbsK4v00SpbdecriifTffIyi2kRGtg0oMvxQMwIcjP9NcOuX8CQv6RIfYIrk='
const decryptionKey = 'lecture-notes-sa';
const ivHex = '25a55c5ad5e50713e1d747f986b37e0f';

export const createTranscribeClient = () => {
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decrypted = CryptoJS.AES.decrypt(encryptedData, decryptionKey, { iv: iv });
  const decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
  const decryptedObject = JSON.parse(decryptedData);

  return new Promise((resolve, reject) => {
      const stsClient = new STSClient({
        region: REGION, 
        credentials: {
          accessKeyId: decryptedObject.AWS_ACCESS_KEY_ID,
          secretAccessKey: decryptedObject.AWS_SECRET_ACCESS_KEY,
        },
      });

      const command = new AssumeRoleCommand({
        RoleArn: "arn:aws:iam::414118545568:role/yhzai-sa-client",
        RoleSessionName: "session1",
        DurationSeconds: 900,
      });

      stsClient.send(command)
      .then((response) => {
        console.log("Obtained AWS credentials");

        resolve(new TranscribeStreamingClient({
          region: REGION,
          credentials: {
            accessKeyId: response.Credentials.AccessKeyId,
            secretAccessKey: response.Credentials.SecretAccessKey,
            sessionToken: response.Credentials.SessionToken,
          },
        }));

      })
    .catch((err) => {
      console.error(err);
      reject(err);
    })
  });
};

export const startStreaming = async (transcribeClient, callback, microphoneStream, socket) => {
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: language,
      MediaEncoding: "pcm",
      MediaSampleRateHertz: SAMPLE_RATE,
      AudioStream: getAudioStream(microphoneStream),
    });

    const data = await transcribeClient.send(command);
    for await (const event of data.TranscriptResultStream) {
      const results = event.TranscriptEvent.Transcript.Results;
      if (results.length && !results[0]?.IsPartial) {
        const newTranscript = results[0].Alternatives[0].Transcript;
        if (socket && socket.readyState === WebSocket.OPEN) {
            sendMessage(socket, newTranscript);
        } else {
            console.log("WebSocket is not open");
        }
        callback(newTranscript + " ");
      }
    }
};