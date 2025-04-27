import CryptoJS from "crypto-js";
import * as ExpoCrypto from 'expo-crypto';

//function to generate key
export const generateRandomKey = async (length = 32) => {
    const key = await ExpoCrypto.getRandomBytesAsync(length)
    const secretKey = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.create(key));
    return secretKey
};

//function to encrypt password
export const encryptPassword = async (password, secretKey) => {
    const SECRET_KEY = CryptoJS.enc.Utf8.parse(secretKey);
    const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
    return encryptedPassword;
};

//function to decrypt password
export const decryptPassword = async (encryptedPassword, secretKey) => {
    const SECRET_KEY = CryptoJS.enc.Utf8.parse(secretKey);
    const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
};
