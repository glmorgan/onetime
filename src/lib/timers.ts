/**
 * Timer Utilities
 * 
 * @fileoverview Manages per-action-instance interval timers to prevent memory leaks.
 * Provides a centralized way to create and clear timers keyed by Stream Deck context.
 * 
 * @module lib/timers
 */

/**
 * Map of active intervals keyed by unique identifier (typically Stream Deck context).
 */
const intervals = new Map<string, NodeJS.Timeout>();

/**
 * Creates or replaces an interval timer for a given key.
 * 
 * @remarks
 * If an interval already exists for the key, it will be cleared before creating the new one.
 * This prevents timer leaks when action instances are reconfigured or updated.
 * 
 * @param key - Unique identifier for the interval (typically Stream Deck context)
 * @param fn - Function to execute on each interval tick
 * @param ms - Interval period in milliseconds
 */
export function createInterval(key: string, fn: () => void, ms: number): void {
    // Clear existing interval if present
    clearInterval(key);

    // Create new interval
    const interval = setInterval(fn, ms);
    intervals.set(key, interval);
}

/**
 * Clears an interval timer for a given key.
 * 
 * @remarks
 * Safe to call even if no interval exists for the key.
 * Should be called in willDisappear lifecycle to prevent timer leaks.
 * 
 * @param key - Unique identifier for the interval to clear
 */
export function clearInterval(key: string): void {
    const interval = intervals.get(key);
    if (interval) {
        globalThis.clearInterval(interval);
        intervals.delete(key);
    }
}

/**
 * Clears all active intervals.
 * 
 * @remarks
 * Useful for cleanup during plugin shutdown or testing.
 */
export function clearAllIntervals(): void {
    for (const [key] of intervals) {
        clearInterval(key);
    }
}
