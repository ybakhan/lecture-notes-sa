import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const BUCKET = "yhzai-sa";
const s3Client = new S3Client({});

export const Save = async (key: string, value: string) => {
  const buffer = Buffer.from(value, "utf8");
  s3Client
    .send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
      }),
    )
    .then(() => {
      console.log(`[s3-client] file saved to s3. file: ${key}` /*, data*/);
    })
    .catch((err) => {
      console.error(`[s3-client] failed to save file to s3. file: ${key}`, err);
    });
};
