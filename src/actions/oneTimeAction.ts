/**
 * One-Time Code Action
 *
 * @fileoverview Stream Deck action that generates a TOTP (time-based one-time password)
 * and outputs it (copy to clipboard or paste into the active app).
 *
 * UX:
 * - Uses 3 manifest states: unconfigured vs invalid vs configured.
 * - Sets state/title guidance, but user-set titles will override.
 * - No background countdown timers or icon animations.
 *
 * @module actions/oneTimeAction
 * @platform macOS
 */

import streamDeck from "@elgato/streamdeck";
import {
    action,
    DidReceiveSettingsEvent,
    KeyDownEvent,
    SendToPluginEvent,
    SingletonAction,
    WillAppearEvent,
    WillDisappearEvent,
} from "@elgato/streamdeck";

import {
    generateTotp,
    getWindowEndUnix,
    normalizeSecret,
    validateBase32,
} from "../lib/totp";
import { copyToClipboard, pasteIntoActiveApp } from "../lib/output";
import { clearInterval } from "../lib/timers";

/** Settings persisted per Stream Deck key instance. */
interface OneTimeSettings {
    [key: string]: any;
    secret?: string;
    digits?: 6 | 8;
    period?: number;
    outputMode?: "clipboard" | "paste";
}

interface InstanceState {
    cachedCode?: string;
    cachedWindowEnd?: number;
    action?: any;
}

@action({ UUID: "com.glmorgan.onetime.one-time-code" })
export class OneTimeAction extends SingletonAction<OneTimeSettings> {
    private instanceStates = new Map<string, InstanceState>();

    private getState(context: string): InstanceState {
        const existing = this.instanceStates.get(context);
        if (existing) return existing;
        const created: InstanceState = {};
        this.instanceStates.set(context, created);
        return created;
    }

    private async syncPresentation(actionInstance: any, settings: OneTimeSettings): Promise<void> {
        const secret = String(settings.secret || "");
        if (!secret) {
            await actionInstance.setState(0);
            await actionInstance.setTitle("Set\nSecret");
            return;
        }

        const normalizedSecret = normalizeSecret(secret);
        if (!validateBase32(normalizedSecret)) {
            await actionInstance.setState(1);
            await actionInstance.setTitle("Invalid\nSecret");
            return;
        }

        await actionInstance.setState(2);
        await actionInstance.setTitle("Generate");
    }

    override async onWillAppear(ev: WillAppearEvent<OneTimeSettings>): Promise<void> {
        const context = ev.action.id;
        const state = this.getState(context);
        state.action = ev.action;

        clearInterval(context);
        const settings = await ev.action.getSettings();
        await this.syncPresentation(ev.action, settings);
    }

    override async onWillDisappear(ev: WillDisappearEvent<OneTimeSettings>): Promise<void> {
        const context = ev.action.id;
        clearInterval(context);
        this.instanceStates.delete(context);
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<OneTimeSettings>): Promise<void> {
        const context = ev.action.id;
        const state = this.getState(context);
        clearInterval(context);

        state.cachedCode = undefined;
        state.cachedWindowEnd = undefined;

        const settings = await ev.action.getSettings();
        await this.syncPresentation(ev.action, settings);
    }

    override async onKeyDown(ev: KeyDownEvent<OneTimeSettings>): Promise<void> {
        const context = ev.action.id;
        const settings = await ev.action.getSettings();
        const state = this.getState(context);
        if (!state.action) state.action = ev.action;

        const secret = String(settings.secret || "");
        const digits = Number(settings.digits) || 6;
        const period = Number(settings.period) || 30;
        const outputMode = String(settings.outputMode) === "paste" ? "paste" : "clipboard";

        if (!secret) {
            await this.syncPresentation(ev.action, settings);
            await ev.action.showAlert();
            return;
        }

        const normalizedSecret = normalizeSecret(secret);
        if (!validateBase32(normalizedSecret)) {
            await this.syncPresentation(ev.action, settings);
            await ev.action.showAlert();
            return;
        }

        if (digits !== 6 && digits !== 8) {
            await ev.action.setState(0);
            await ev.action.showAlert();
            return;
        }

        if (![15, 30, 60].includes(period)) {
            await ev.action.setState(0);
            await ev.action.showAlert();
            return;
        }

        const now = Date.now();
        const currentWindowEnd = getWindowEndUnix(period, now);

        let code: string;
        if (state.cachedCode && state.cachedWindowEnd && Math.floor(now / 1000) < state.cachedWindowEnd) {
            code = state.cachedCode;
        } else {
            code = generateTotp(normalizedSecret, digits, period, now);
            if (code === "INVALID_SECRET" || code === "GENERATION_ERROR") {
                await ev.action.setState(0);
                await ev.action.showAlert();
                return;
            }
            state.cachedCode = code;
            state.cachedWindowEnd = currentWindowEnd;
        }

        try {
            if (outputMode === "paste") {
                await pasteIntoActiveApp(code);
            } else {
                await copyToClipboard(code);
            }
            await ev.action.showOk();
            clearInterval(context);
            await this.syncPresentation(ev.action, settings);
        } catch {
            await ev.action.setState(0);
            await ev.action.showAlert();
        }
    }

    override async onSendToPlugin(_ev: SendToPluginEvent<any, OneTimeSettings>): Promise<void> {
        // No-op (MVP)
    }
}
