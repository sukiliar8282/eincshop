import { makeHttpSecretBinding } from "./SecretHttp.js";
export const bytesToBase64 = (bytes) => Buffer.from(bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes)).toString("base64");
export const base64ToBytes = (value) => Uint8Array.from(Buffer.from(value ?? "", "base64"));
export const makeHttpSecretKeyBinding = (options) => makeHttpSecretBinding({ ...options, kms: true });
//# sourceMappingURL=SecretKeyHttp.js.map