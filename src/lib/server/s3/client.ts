// ==============================================================================
// MADHUS BOUTIQUE: AWS S3 CLIENT FACTORY (SERVER-SIDE ONLY)
// Zero-trust AWS credential management; strictly never executed on browser.
// ==============================================================================

import { S3Client } from "@aws-sdk/client-s3";

const awsRegion = process.env.AWS_REGION || "ap-south-1";
const s3Bucket = process.env.AWS_S3_BUCKET || "madhus-boutique-private";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export function getS3BucketName(): string {
  return s3Bucket;
}

export function getS3Region(): string {
  return awsRegion;
}

/**
 * Returns an authenticated S3Client instance.
 * MUST NEVER BE CALLED FROM CLIENT COMPONENTS.
 */
export function createServerS3Client(): S3Client {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: createServerS3Client() cannot be invoked in the browser context."
    );
  }

  // If live credentials are provided in environment, use them;
  // otherwise provide a mock-compatible development client.
  if (accessKeyId && secretAccessKey) {
    return new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  // Development fallback (uses standard mock config to prevent crash when secrets are pending)
  return new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: "mock-access-key-id",
      secretAccessKey: "mock-secret-access-key",
    },
  });
}
