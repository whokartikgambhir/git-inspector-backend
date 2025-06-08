// external dependencies
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const rawKey = process.env.ENCRYPTION_KEY;
if (!rawKey) {
  throw new Error("Missing ENCRYPTION_KEY in environment");
}

const KEY = Buffer.from(rawKey, "hex");
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  };
}

export function decrypt(encrypted: { iv: string; content: string; tag: string }) {
  const iv = Buffer.from(encrypted.iv, "hex");
  const tag = Buffer.from(encrypted.tag, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
