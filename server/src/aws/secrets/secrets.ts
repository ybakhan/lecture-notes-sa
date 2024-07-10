import NodeCache from "node-cache";
import { GetSecret as GetSecretFromSecretManager } from "./secrets-manager-client";

const cache = new NodeCache();

export const GetSecret = (secretName: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const cachedSecret = cache.get<string>(secretName);
    if (cachedSecret) {
      console.log("[secrets] Secret fetched from cache");
      resolve(cachedSecret);
    } else {
      GetSecretFromSecretManager(secretName)
        .then((secret) => {
          cache.set(secretName, secret, 3600);
          console.log("[secrets] Secret saved in cache");
          resolve(secret);
        })
        .catch((err) => {
          console.error("[secrets] Error fetching secret", err);
          reject(err);
        });
    }
  });
};
