# One-Time

Generate time-based one-time passwords (TOTP) from your Stream Deck.

## What It Does

One-Time adds a single Stream Deck action (**One-Time Code**) that outputs a TOTP code on demand.

- Configure a Base32 secret per key.
- Press the key to copy (or paste) the current code.
- The key’s icon reflects whether it’s configured.

This is designed to be fast and unobtrusive: no background countdown timers and no animated icons.

## Features

- **One-press output**
  Press a key to output the current one-time code.

- **Copy or paste**
  Choose between copying to the clipboard or pasting into the active app.

- **Smart caching**
  Pressing multiple times within the same TOTP window reuses the same code.

- **Per-key settings**
  Each key has its own secret, digits (6/8), period (15/30/60), and output mode.

- **Configured/unconfigured states**
  Uses action states so unconfigured keys show a different icon.

## Installation

### From the Stream Deck Marketplace (Pending Publication)

1. Open the Stream Deck application
2. Go to the Marketplace
3. Search for "One-Time"
4. Click Install

### Manual Installation (Development)

1. Install dependencies:
   ```bash
   cd "streamdeck"
   npm install
   ```

2. Build the plugin:
   ```bash
   npm run build
   ```

3. Link the plugin to Stream Deck:
   ```bash
   ln -s "$(pwd)/com.glmorgan.onetime.sdPlugin" \
     "$HOME/Library/Application Support/com.elgato.StreamDeck/Plugins/"
   ```

4. Restart Stream Deck (choose one):

   **Option 1:** Using CLI (requires `npm install -g @elgato/cli`)
   ```bash
   streamdeck restart com.glmorgan.onetime
   ```

   **Option 2:** Manually quit and reopen the Stream Deck application

## How It Works

### Basic Usage

1. Add the **One-Time Code** action to a Stream Deck key
2. In the Property Inspector, set your secret (Base32)
3. Press the key to output a code

### Output Modes

- **Copy to clipboard** (default)
  Uses `pbcopy`.

- **Paste into active app**
  Copies the code and simulates Cmd+V via `osascript`.
  This requires macOS Accessibility permissions.

### Visual States

The key changes state based on configuration:

- **Unconfigured**: no secret set (shows the unconfigured icon)
- **Configured**: secret set and valid (shows the configured icon)

## Platform Support

- **macOS**: supported (12+)

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Restart Plugin
```bash
streamdeck restart com.glmorgan.onetime
```

### Logs

Plugin logs are written inside the plugin bundle:

`com.glmorgan.onetime.sdPlugin/logs/`

## Technical Details

- Built with TypeScript using `@elgato/streamdeck`
- TOTP generation via `otplib`
- macOS output via `pbcopy` and `osascript`

### Source Layout

```
src/
  plugin.ts               # Entry point
  actions/
    oneTimeAction.ts      # One-Time Code action
  lib/
    totp.ts               # TOTP helpers
    output.ts             # Clipboard/paste helpers
    timers.ts             # Timer utilities (minimal usage)
```

## Troubleshooting

### Paste mode doesn’t work

- Enable Accessibility permissions for Stream Deck:
  System Settings → Privacy & Security → Accessibility

### “Invalid secret” / wrong codes

- Ensure the secret is Base32 (A–Z, 2–7)
- Ensure your system clock is correct
- Confirm the period matches the service (30s is most common)

## License

MIT

## Author

Glen Morgan
