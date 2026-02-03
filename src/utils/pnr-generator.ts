import * as crypto from 'crypto';

/**
 * Generates a cryptographically secure internal PNR
 * Format: 5 uppercase letters + 5 digits (total 10 characters)
 * Example: ABCDE12345
 */
export function generateInternalPnr(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';

    let result = '';

    // Generate 5 random uppercase letters
    for (let i = 0; i < 5; i++) {
        const randomIndex = crypto.randomInt(0, letters.length);
        result += letters[randomIndex];
    }

    // Generate 5 random digits
    for (let i = 0; i < 5; i++) {
        const randomIndex = crypto.randomInt(0, digits.length);
        result += digits[randomIndex];
    }

    return result;
}

/**
 * Validates if a PNR follows the internal PNR format
 * @param pnr - The PNR to validate
 * @returns boolean - True if it matches internal PNR format
 */
export function isInternalPnrFormat(pnr: string): boolean {
    return /^[A-Z]{5}[0-9]{5}$/.test(pnr);
}