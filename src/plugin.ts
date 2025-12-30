/**
 * One-Time - Stream Deck Plugin Entry Point
 * 
 * @fileoverview Main entry point for the One-Time Stream Deck plugin.
 * Generates time-based one-time passwords with live countdown display.
 * 
 * @module plugin
 * @author Glen Morgan
 * @version 1.0.0
 * @platform macOS
 */

import streamDeck from "@elgato/streamdeck";

import { OneTimeAction } from "./actions/oneTimeAction";
import { clearAllIntervals } from "./lib/timers";

/**
 * Configure logging level for the plugin.
 * 
 * Note: Set to "info" in production to avoid logging sensitive TOTP data.
 * Available levels: "trace", "debug", "info", "warn", "error"
 */

// Ensure no old intervals are running from previous plugin loads
clearAllIntervals();
streamDeck.logger.setLevel("debug");

/**
 * Register the One-Time action with the Stream Deck.
 */
streamDeck.actions.registerAction(new OneTimeAction());

/**
 * Establish connection with the Stream Deck application.
 */
streamDeck.connect();
