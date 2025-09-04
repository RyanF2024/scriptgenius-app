import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { promisify } from 'util';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // For GCM, 12 bytes is recommended
const SALT_LENGTH = 16;
const ITERATIONS = 10000; // Number of iterations for key derivation
const KEY_LENGTH = 32; // 32 bytes for AES-256

// Get encryption key from environment variable
const getKey = (): Buffer => {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return scryptSync(encryptionKey, 'salt', KEY_LENGTH);
};

export const encrypt = (text: string): string => {
  try {
    const iv = randomBytes(IV_LENGTH);
    const key = getKey();
    const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: 16 });
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV + auth tag + encrypted data
    const encryptedData = Buffer.concat([iv, authTag, encrypted]);
    
    return encryptedData.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decrypt = (encryptedText: string): string => {
  try {
    const encryptedData = Buffer.from(encryptedText, 'base64');
    
    // Extract IV (first 12 bytes), auth tag (next 16 bytes), and encrypted data (the rest)
    const iv = encryptedData.subarray(0, IV_LENGTH);
    const authTag = encryptedData.subarray(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = encryptedData.subarray(IV_LENGTH + 16);
    
    const key = getKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Helper to check if a string is encrypted
const ENCRYPTED_PREFIX = 'enc:';

export const isEncrypted = (text: string): boolean => {
  return text.startsWith(ENCRYPTED_PREFIX);
};

export const ensureEncrypted = (text: string): string => {
  return isEncrypted(text) ? text : `${ENCRYPTED_PREFIX}${encrypt(text)}`;
};

export const ensureDecrypted = (text: string): string => {
  return isEncrypted(text) ? decrypt(text.substring(ENCRYPTED_PREFIX.length)) : text;
};
