/**
 * Untrusted document intake policy.
 *
 * The mobile app currently sends only a reference label into chat; it does not
 * upload arbitrary document bytes to the AI gateway. If binary extraction is
 * enabled later, this validator must run before any parsing/storage boundary.
 */

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_TEXT_CHARS = 40_000;

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'text/plain',
    'application/rtf',
    'text/rtf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['pdf', 'txt', 'rtf', 'docx', 'jpg', 'jpeg', 'png', 'webp']);

export type UntrustedDocumentMetadata = {
    name: string;
    size?: number;
    mimeType?: string;
};

const extensionOf = (name: string): string => {
    const match = /\\.([a-z0-9]+)$/i.exec(name.trim());
    return match?.[1]?.toLowerCase() ?? '';
};

export const sanitizeDocumentName = (name: string): string => {
    const base = name.trim().replace(/[\\/\\0-\\r\\n]/g, '_');
    return base.slice(0, 180) || 'document';
};

export const validateDocumentMetadata = (input: UntrustedDocumentMetadata): void => {
    if (!input || typeof input.name !== 'string') {
        throw new Error('A valid document name is required.');
    }

    if (typeof input.size === 'number' && (input.size < 0 || input.size > MAX_DOCUMENT_BYTES)) {
        throw new Error('Document exceeds the 10 MB upload limit.');
    }

    const mime = input.mimeType?.toLowerCase();
    const extension = extensionOf(input.name);

    if (mime && !ALLOWED_MIME_TYPES.has(mime)) {
        throw new Error('This document type is not supported.');
    }

    if (!ALLOWED_EXTENSIONS.has(extension)) {
        throw new Error('This document extension is not supported.');
    }

    // A supplied MIME type and extension must agree when both are available.
    if (mime === 'application/pdf' && extension !== 'pdf') {
        throw new Error('Document type does not match its extension.');
    }
    if ((mime === 'text/plain' && extension !== 'txt') || ((mime === 'application/rtf' || mime === 'text/rtf') && extension !== 'rtf')) {
        throw new Error('Document type does not match its extension.');
    }
    if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && extension !== 'docx') {
        throw new Error('Document type does not match its extension.');
    }
    if (mime?.startsWith('image/') && !['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
        throw new Error('Document type does not match its extension.');
    }
};

export const wrapUntrustedText = (text: string): string => {
    if (typeof text !== 'string') throw new Error('Document text must be a string.');
    const normalized = text.trim();
    if (!normalized) throw new Error('Document text is empty.');
    if (normalized.length > MAX_DOCUMENT_TEXT_CHARS) {
        throw new Error('Extracted document text is too large.');
    }

    return [
        '<untrusted-document>',
        normalized,
        '</untrusted-document>',
    ].join('\\n');
};
