import { createHash, createDecipheriv, createCipheriv, randomBytes } from "crypto";

const SECRET_PREFIX = "omnimatrix-profile:v1:";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

type SecretInput = {
  proxyPassword?: string | null;
  credentials?: Record<string, string> | null;
};

function getEncryptionKey(): Buffer {
  const applicationSecret = process.env.JWT_SECRET;
  if (!applicationSecret) {
    throw new Error("Profile secret encryption is unavailable because the application secret is not configured.");
  }

  return createHash("sha256")
    .update("omnimatrix:profile-secrets:v1:")
    .update(applicationSecret)
    .digest();
}

function encode(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function decode(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function encryptProfileSecret(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${SECRET_PREFIX}${encode(iv)}.${encode(authTag)}.${encode(ciphertext)}`;
}

export function decryptProfileSecret(value: string): string {
  if (!value.startsWith(SECRET_PREFIX)) {
    return value;
  }

  const payload = value.slice(SECRET_PREFIX.length).split(".");
  if (payload.length !== 3) {
    throw new Error("Stored profile secret has an invalid encryption payload.");
  }

  const [ivValue, tagValue, ciphertextValue] = payload;
  const iv = decode(ivValue);
  const authTag = decode(tagValue);
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Stored profile secret has an invalid encryption payload.");
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(decode(ciphertextValue)), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Stored profile secret could not be decrypted.");
  }
}

export function encryptProfileSecrets<T extends SecretInput>(input: T): T {
  const credentials = input.credentials
    ? Object.fromEntries(Object.entries(input.credentials).map(([key, value]) => [key, encryptProfileSecret(value)]))
    : input.credentials;
  const proxyPassword = input.proxyPassword ? encryptProfileSecret(input.proxyPassword) : input.proxyPassword;

  return { ...input, proxyPassword, credentials } as T;
}

export function decryptProfileSecrets<T extends SecretInput>(profile: T): T {
  const credentials = profile.credentials
    ? Object.fromEntries(Object.entries(profile.credentials).map(([key, value]) => [key, decryptProfileSecret(value)]))
    : profile.credentials;
  const proxyPassword = profile.proxyPassword ? decryptProfileSecret(profile.proxyPassword) : profile.proxyPassword;

  return { ...profile, proxyPassword, credentials } as T;
}
