import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key_change_in_prod_32chars'; // Fallback for dev

// Ensure key is 32 bytes
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);

export class EncryptionService {

    encrypt(text: string): string {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    decrypt(text: string): string {
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift()!, 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }
}

export const encryptionService = new EncryptionService();
