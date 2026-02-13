import * as Crypto from 'expo-crypto';

/**
 * Generates a random code verifier for PKCE
 * @returns A URL-safe base64 encoded random string
 */
export async function generateCodeVerifier(): Promise<string> {
    const bytes = await Crypto.getRandomBytesAsync(32);
    // Convert Uint8Array to base64url
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Generates a code challenge from a verifier using SHA-256
 * @param verifier The code verifier string
 * @returns A SHA-256 hashed, base64url encoded challenge
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    // Convert base64 to base64url
    return digest.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
