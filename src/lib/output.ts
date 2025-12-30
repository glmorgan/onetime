/**
 * Output Helpers
 * 
 * @fileoverview Provides utilities for outputting TOTP codes via clipboard or paste.
 * Handles macOS-specific clipboard operations and simulated paste via AppleScript.
 * 
 * @module lib/output
 * @platform macOS
 */

import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Copies text to the macOS system clipboard.
 * 
 * @remarks
 * Uses the native `pbcopy` command-line utility with piped stdin for safe execution.
 * 
 * @param text - The text to copy to clipboard (TOTP code)
 * @returns Promise that resolves when copy operation completes
 * @throws Error if pbcopy fails
 */
export async function copyToClipboard(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const pbcopy = spawn('pbcopy');

        pbcopy.stdin.write(text);
        pbcopy.stdin.end();

        pbcopy.on('error', (error) => {
            reject(new Error('Failed to copy to clipboard'));
        });

        pbcopy.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error('Failed to copy to clipboard'));
            }
        });
    });
}

/**
 * Pastes text into the active application by copying to clipboard and simulating Cmd+V.
 * 
 * @remarks
 * This is a two-step process:
 * 1. Copy the text to clipboard using pbcopy
 * 2. Send Cmd+V keystroke using AppleScript via osascript
 * 
 * Note: Requires accessibility permissions for osascript to send keystrokes.
 * If paste fails, the text will still be on the clipboard as a fallback.
 * 
 * @param text - The text to paste (TOTP code)
 * @returns Promise that resolves when paste operation completes
 * @throws Error if either clipboard or paste operation fails
 */
export async function pasteIntoActiveApp(text: string): Promise<void> {
    // First, copy to clipboard
    await copyToClipboard(text);

    // Then simulate Cmd+V using AppleScript
    const appleScript = `
        tell application "System Events"
            keystroke "v" using command down
        end tell
    `;

    try {
        await execFileAsync('osascript', ['-e', appleScript]);
    } catch (error) {
        // If paste fails, at least the code is on clipboard
        throw new Error('Paste failed (code copied to clipboard)');
    }
}
