import {
  S3Client,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: "Missing key" });

  try {
    // 1) Check metadata first (this tells us the storage class)
    const head = await s3.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      })
    );

    const storageClass = head.StorageClass || "STANDARD"; // STANDARD often comes as undefined
    const restore = head.Restore || ""; 

    // 2) If Glacier + not restored => block and return a clear error
    const isArchive =
      storageClass === "GLACIER"

    const isRestored = restore.includes('ongoing-request="false"');

    if (isArchive && !isRestored) {
      return res.status(409).json({
        error: "InvalidObjectState",
        message: `Object is archived (${storageClass}). Restore required before download.`,
        storageClass,
      });
    }

    // 3) Otherwise sign URL normally
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    return res.status(200).json({ url, storageClass });
  } catch (err) {
    return res.status(500).json({
      error: err?.name || "S3Error",
      message: err?.message || "Failed",
    });
  }
}