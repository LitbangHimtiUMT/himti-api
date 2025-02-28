import CryptoJS from "crypto-js";

export function decryptAES(encryptedText: string, ivBase64: string, secret: string) {
    const secretKey = secret.padEnd(32, "0"); // Menyamakan dengan Dart (32-byte)
    const key = CryptoJS.enc.Utf8.parse(secretKey); // Konversi ke WordArray
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8); // Konversi ke string UTF-8
  }