import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing required AWS environment variables");
}

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const AWS_S3_PUBLIC_BUCKET = process.env.AWS_S3_PUBLIC_BUCKET;

if (!AWS_S3_PUBLIC_BUCKET) {
  throw new Error("Missing AWS_S3_PUBLIC_BUCKET environment variable");
}

