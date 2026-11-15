import { z } from "zod";

export const contributorProfileSchema = z.object({ displayName: z.string().trim().min(1).max(60), biography: z.string().trim().max(500).default(""), consent: z.boolean() });

export function validContributorPhoto(bytes: Uint8Array, type: string, size: number) {
  if (size < 1 || size > 5 * 1024 * 1024) return false;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9;
  if (type === "image/png") return String.fromCharCode(...bytes.subarray(0, 8)) === "\x89PNG\r\n\x1a\n";
  if (type === "image/webp") return String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" && String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP";
  return false;
}
