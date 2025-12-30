/**
 * TOTP Library Wrapper
 * 
 * @fileoverview Provides secure TOTP generation utilities using otplib.
 * Handles secret normalization, validation, and time-based one-time password generation.
 * 
 * @module lib/totp
 */

import { authenticator } from 'otplib';

/**
 * Normalizes a Base32 secret by removing spaces and converting to uppercase.
 * 
 * @param input - Raw secret string (may contain spaces, lowercase, etc.)
 * @returns Normalized Base32 secret string
 */
export function normalizeSecret(input: string): string {
    return input.replace(/\s+/g, '').toUpperCase();
}

/**
 * Validates if a string appears to be a valid Base32 secret.
 * 
 * @remarks
 * This performs basic validation (character set check), not cryptographic validation.
 * Base32 alphabet: A-Z, 2-7, and optional padding with =
 * 
 * @param secret - The secret to validate
 * @returns True if the secret appears to be valid Base32
 */
export function validateBase32(secret: string): boolean {
    if (!secret || secret.length === 0) {
        return false;
    }

    // Base32 alphabet: A-Z, 2-7, optional padding =
    const base32Regex = /^[A-Z2-7]+=*$/;
    const normalized = normalizeSecret(secret);

    return base32Regex.test(normalized);
}

/**
 * Generates a TOTP code from a Base32 secret.
 * 
 * @param secret - Base32 encoded secret
 * @param digits - Number of digits in the output code (6 or 8)
 * @param period - Time period in seconds (typically 30 or 60)
 * @param now - Optional timestamp in milliseconds (defaults to Date.now())
 * @returns The generated TOTP code
 * @throws Returns error message string if generation fails (never throws with secret in message)
 */
export function generateTotp(
    secret: string,
    digits: 6 | 8 = 6,
    period: number = 30,
    now?: number
): string {
    try {
        const normalized = normalizeSecret(secret);

        if (!validateBase32(normalized)) {
            return 'INVALID_SECRET';
        }

        // Configure authenticator
        authenticator.options = {
            digits,
            step: period,
            window: 0
        };

        // Generate token
        const token = authenticator.generate(normalized);
        return token;
    } catch (error) {
        // Never log or return the secret
        return 'GENERATION_ERROR';
    }
}

/**
 * Calculates the number of seconds remaining in the current TOTP window.
 * 
 * @param period - Time period in seconds (typically 30 or 60)
 * @param now - Optional timestamp in milliseconds (defaults to Date.now())
 * @returns Number of seconds remaining until the current code expires
 */
export function getRemainingSeconds(period: number = 30, now?: number): number {
    const timestamp = now !== undefined ? now : Date.now();
    const unixSeconds = Math.floor(timestamp / 1000);
    const remaining = period - (unixSeconds % period);
    return remaining;
}

/**
 * Gets the Unix timestamp (in seconds) when the current TOTP window ends.
 * 
 * @param period - Time period in seconds (typically 30 or 60)
 * @param now - Optional timestamp in milliseconds (defaults to Date.now())
 * @returns Unix timestamp in seconds when the current window expires
 */
export function getWindowEndUnix(period: number = 30, now?: number): number {
    const timestamp = now !== undefined ? now : Date.now();
    const unixSeconds = Math.floor(timestamp / 1000);
    const remaining = getRemainingSeconds(period, timestamp);
    return unixSeconds + remaining;
}
