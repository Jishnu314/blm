const encoder = new TextEncoder();

const bytesToHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex) => {
  const clean = hex || "";
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return bytes;
};

const getRandomHex = (length = 16) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

const digest = async (value) => {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToHex(new Uint8Array(hash));
};

export const AUTH_SESSION_KEY = "ledger-auth-session-v1";

export const isValidPin = (pin) => /^\d{6}$/.test(pin);

export const makeUsername = (name, agentIdNumber) => {
  const source = agentIdNumber || name || "agent";
  return source.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 18) || "agent";
};

export const createAuthRecord = async ({ username, pin, recoveryHint = "" }) => {
  const salt = getRandomHex(16);
  return {
    username: username.trim().toLowerCase(),
    type: "pin",
    passwordSalt: salt,
    passwordHash: await digest(`${salt}:${pin}`),
    recoveryHint: recoveryHint.trim(),
    passwordUpdatedAt: new Date().toISOString(),
  };
};

export const verifyPassword = async (auth, pin) => {
  if (!auth?.passwordSalt || !auth?.passwordHash) return false;
  const hash = await digest(`${auth.passwordSalt}:${pin}`);
  const expected = hexToBytes(auth.passwordHash);
  const actual = hexToBytes(hash);
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected[i] ^ actual[i];
  return diff === 0;
};
