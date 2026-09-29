/**
 * Centralized Logger
 * Handles logging and automatically redacts sensitive information.
 */

const SENSITIVE_KEYS = [
    'password',
    'access_token',
    'refresh_token',
    'token',
    'code_verifier',
    'newPassword',
    'confirmPassword',
    'Authorization',
    'code',
    'content',
    'document',
    'documentText',
    'details',
    'reason',
    'userDetails',
    'intakeData',
    'query',
    'prompt',
];

/**
 * Redact sensitive information from objects or strings
 */
const redact = (data: any): any => {
    if (data instanceof Error) {
        return {
            name: data.name,
            message: data.message,
            stack: __DEV__ ? data.stack : undefined,
        };
    }

    if (typeof data === 'string') {
        // Redact JWT-like strings (very basic heuristic)
        if (data.length > 100 && (data.includes('eyJ') || data.includes('.'))) {
            return '[REDACTED TOKEN]';
        }
        return data;
    }

    if (data && typeof data === 'object') {
        const redacted: any = Array.isArray(data) ? [] : {};

        for (const key in data) {
            if (SENSITIVE_KEYS.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
                redacted[key] = '[REDACTED]';
            } else if (typeof data[key] === 'object') {
                redacted[key] = redact(data[key]);
            } else {
                redacted[key] = data[key];
            }
        }
        return redacted;
    }

    return data;
};

const sanitizeUrl = (url: string): string => {
    if (!url) return url;

    // Redact tokens and codes from URL query parameters and fragments
    return url.replace(/([?#&](?:access_token|refresh_token|code|state)=)[^&]+/g, '$1[REDACTED]');
};

export const logger = {
    log: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.log(sanitizeUrl(message), ...args.map(redact));
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.warn(sanitizeUrl(message), ...args.map(redact));
        }
    },
    error: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.error(sanitizeUrl(message), ...args.map(redact));
        }
    },
    debug: (message: string, ...args: any[]) => {
        if (__DEV__) {
            console.debug(sanitizeUrl(message), ...args.map(redact));
        }
    }
};

export default logger;
