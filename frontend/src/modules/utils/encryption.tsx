import CryptoJS from "crypto-js";
import { TOKEN } from "../../settings/localVar";

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "default_key";

export const encryptData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptData = (data: string): string => {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const saveToken = (data: string) => {
  if (!ENCRYPTION_KEY) throw new Error("No encryption key found");
  const enc_data = encryptData(data);
  localStorage.setItem(TOKEN, enc_data);
};

export const getToken = (): string | null => {
  if (!ENCRYPTION_KEY) throw new Error("No encryption key found");
  const enc_Token = localStorage.getItem(TOKEN);
  if (!enc_Token) {
    return null;
  }
  return decryptData(enc_Token);
};
