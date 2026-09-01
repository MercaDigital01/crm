import { createHash } from "crypto";

// Cloudinary signed-upload signature: SHA1 of every param except file/
// cloud_name/resource_type/api_key, sorted by key, plus the API secret.
// https://cloudinary.com/documentation/signatures
export function signUploadParams(params: Record<string, string | number>) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) {
    throw new Error("Falta configurar CLOUDINARY_API_SECRET");
  }

  return createHash("sha1").update(toSign + secret).digest("hex");
}
