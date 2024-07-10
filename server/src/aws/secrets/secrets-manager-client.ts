import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const smClient = new SecretsManagerClient({});

export const GetSecret = (secretName: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    smClient
      .send(
        new GetSecretValueCommand({
          SecretId: secretName,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        }),
      )
      .then((data) => {
        const secret: { OPENAI_API_KEY: string } = JSON.parse(
          <string>data.SecretString,
        );
        console.log(
          "[secrets-manager-client] Obtained secret from secrets manager",
        );
        resolve(secret.OPENAI_API_KEY);
      })
      .catch((err) => {
        console.error("[secrets-manager-client] Error fetching secret:", err);
        reject(err);
      });
  });
};
