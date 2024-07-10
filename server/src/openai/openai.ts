import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { GetSecret } from "../aws/secrets/secrets";

export const Chat = async (
  fileName: string,
  question: string,
): Promise<string> => {
  const filePath = path.join(__dirname, fileName);
  console.log(`reading file: ${filePath}`);
  const content = fs.readFileSync(filePath, "utf8");

  const apiKey = await GetSecret("OPENAI_API_KEY");
  const openAIClient = new OpenAI({
    apiKey,
  });

  return new Promise((resolve, reject) => {
    openAIClient.chat.completions
      .create({
        messages: [
          {
            role: "system",
            content: question,
          },
          {
            role: "user",
            content,
          },
        ],
        model: "gpt-3.5-turbo",
      })
      .then((completion) => {
        if (completion.choices.length === 0) {
          console.log("[openai] no response from OpenAI");
          resolve("no response from OpenAI");
        } else {
          const messageContent = completion.choices[0]?.message?.content;
          if (typeof messageContent === "string") {
            console.log(`[openai] OpenAI response: ${messageContent}`);
            resolve(messageContent);
          } else {
            console.log("[openai] invalid content in response");
            reject(new Error("invalid content in response"));
          }
        }
      })
      .catch((error) => {
        console.error("[openai] Error during OpenAI call:", error);
        reject(new Error("Error during OpenAI call"));
      });
  });
};
