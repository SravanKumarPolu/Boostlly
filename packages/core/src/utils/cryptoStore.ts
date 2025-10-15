import { logError, logDebug, logWarning } from "./logger";
/**
 * Encrypted local storage using Web Crypto API
 */

interface CryptoStoreOptions {
  algorithm?: string;
  keyLength?: number;
}

class CryptoStore {
  private key: CryptoKey | null = null;
  private keyId = "boostlly_crypto_key";
  private algorithm = "AES-GCM";
  private keyLength = 256;

  constructor(options: CryptoStoreOptions = {}) {
    this.algorithm = options.algorithm || this.algorithm;
    this.keyLength = options.keyLength || this.keyLength;
  }

  /**
   * Initialize the crypto store by generating or loading the encryption key
   */
  private async initialize(): Promise<void> {
    if (this.key) return;

    try {
      // Try to load existing key
      const storedKey = this.getStorage().getItem(this.keyId);

      if (storedKey) {
        // Import existing key
        const keyData = this.base64ToArrayBuffer(storedKey);
        this.key = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: this.algorithm, length: this.keyLength },
          false,
          ["encrypt", "decrypt"],
        );
      } else {
        // Generate new key
        this.key = await crypto.subtle.generateKey(
          {
            name: this.algorithm,
            length: this.keyLength,
          },
          true,
          ["encrypt", "decrypt"],
        );

        // Export and store the key
        const exportedKey = await crypto.subtle.exportKey("raw", this.key);
        const keyString = this.arrayBufferToBase64(exportedKey);
        this.getStorage().setItem(this.keyId, keyString);
      }
    } catch (error) {
      logError("Failed to initialize crypto store:", { error: error });
      throw new Error("Crypto initialization failed");
    }
  }

  /**
   * Get the appropriate storage object
   */
  private getStorage(): Storage {
    if (typeof window !== "undefined") {
      return window.localStorage;
    }
    throw new Error("Storage not available");
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Encrypt data
   */
  private async encrypt(data: string): Promise<string> {
    await this.initialize();

    if (!this.key) {
      throw new Error("Crypto key not available");
    }

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv,
      },
      this.key,
      encodedData,
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypt data
   */
  private async decrypt(encryptedData: string): Promise<string> {
    await this.initialize();

    if (!this.key) {
      throw new Error("Crypto key not available");
    }

    try {
      const combined = this.base64ToArrayBuffer(encryptedData);
      const combinedArray = new Uint8Array(combined);

      // Extract IV and encrypted data
      const iv = combinedArray.slice(0, 12);
      const encrypted = combinedArray.slice(12);

      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv,
        },
        this.key,
        encrypted,
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      logError("Decryption failed:", { error: error });
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Store encrypted data
   */
  async secureSet(key: string, data: unknown): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      const encrypted = await this.encrypt(jsonData);
      this.getStorage().setItem(`encrypted_${key}`, encrypted);
    } catch (error) {
      logError("Failed to encrypt and store data:", { error: error });
      // Fallback to unencrypted storage
      this.getStorage().setItem(key, JSON.stringify(data));
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async secureGet<T>(key: string): Promise<T | null> {
    try {
      const encrypted = this.getStorage().getItem(`encrypted_${key}`);

      if (encrypted) {
        const decrypted = await this.decrypt(encrypted);
        return JSON.parse(decrypted);
      }

      // Fallback to unencrypted data
      const unencrypted = this.getStorage().getItem(key);
      return unencrypted ? JSON.parse(unencrypted) : null;
    } catch (error) {
      logError("Failed to decrypt data:", { error: error });
      // Try unencrypted fallback
      try {
        const unencrypted = this.getStorage().getItem(key);
        return unencrypted ? JSON.parse(unencrypted) : null;
      } catch {
        return null;
      }
    }
  }

  /**
   * Remove encrypted data
   */
  secureRemove(key: string): void {
    this.getStorage().removeItem(`encrypted_${key}`);
    this.getStorage().removeItem(key); // Also remove unencrypted version
  }

  /**
   * Check if crypto is supported
   */
  static isSupported(): boolean {
    return (
      typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  }
}

// Create a singleton instance
const cryptoStore = new CryptoStore();

export { cryptoStore };
export type { CryptoStoreOptions };

// Convenience functions
export async function secureSet(key: string, data: unknown): Promise<void> {
  return cryptoStore.secureSet(key, data);
}

export async function secureGet<T>(key: string): Promise<T | null> {
  return cryptoStore.secureGet<T>(key);
}

export function secureRemove(key: string): void {
  cryptoStore.secureRemove(key);
}

export function isCryptoSupported(): boolean {
  return CryptoStore.isSupported();
}
