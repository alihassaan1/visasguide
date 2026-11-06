import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Cloudflare R2 (S3-compatible) image storage for visas.guide.
// Public assets are served from the custom domain connected to the bucket.
const R2_ACCOUNT_ID = "0e186cf10248391d7f7e481950644bb7";
const R2_BUCKET = "visas-guide";
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const PUBLIC_BASE_URL = "https://cdn.visas.guide";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

function sanitizeKeyPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function base64ToBytes(base64: string): Uint8Array {
  const bin = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export const uploadImageToR2 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (data: {
      fileName: string;
      contentType: string;
      dataBase64: string;
      folder?: string;
    }) => {
      if (!data || typeof data.fileName !== "string" || !data.fileName) {
        throw new Error("fileName is required");
      }
      if (!ALLOWED_TYPES.has(data.contentType)) {
        throw new Error(`Unsupported image type: ${data.contentType}`);
      }
      if (typeof data.dataBase64 !== "string" || !data.dataBase64) {
        throw new Error("Image data is required");
      }
      // base64 expands size by ~4/3
      if (data.dataBase64.length > Math.ceil(MAX_UPLOAD_BYTES * 1.4)) {
        throw new Error("Image exceeds the 10MB limit");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    // Only site admins may upload images.
    const { data: adminRow } = await context.supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!adminRow) {
      throw new Error("Forbidden: admin access required");
    }

    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey) {
      throw new Error("R2 storage is not configured");
    }

    const { AwsClient } = await import("aws4fetch");
    const r2 = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    const folder = sanitizeKeyPart(data.folder || "uploads") || "uploads";
    const ext = (data.fileName.split(".").pop() || "bin").toLowerCase();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const body = base64ToBytes(data.dataBase64);
    const response = await r2.fetch(`${R2_ENDPOINT}/${R2_BUCKET}/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": data.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: new Blob([body as Uint8Array<ArrayBuffer>], { type: data.contentType }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`R2 upload failed [${response.status}]: ${text}`);
      throw new Error(`Image upload failed (status ${response.status})`);
    }

    return { url: `${PUBLIC_BASE_URL}/${key}`, key };
  });
