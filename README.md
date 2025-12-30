# One-Time

Turn your Elgato Stream Deck into a fast, no-fuss TOTP button. Press once to copy (or paste) a time-based one-time code, and move on.

## What It Does

One-Time adds a single action (**One-Time Code**) to Stream Deck.

Assign it to a key, set a Base32 secret in the Property Inspector, and then press the key whenever you need a code. The plugin will generate the current TOTP and output it based on your selected mode.

This is intentionally lightweight:

- No background countdown timers
- No animated icons
- Visual states show configured vs unconfigured at a glance

This is especially useful when you have a few services that still require typing a TOTP frequently and you want to keep your hands on the keyboard.

## Features

- **One-press output**  
  Press to output the current one-time code

- **Copy or paste**  
  Copy to clipboard, or paste directly into the active app

- **Smart caching**  
  Repeated presses in the same TOTP window reuse the same code

- **Per-key settings**  
  Each key stores its own secret, digits (6/8), period (15/30/60), and output mode

- **Visual feedback**  
  Icons reflect whether the key is configured (and can show an invalid/misconfigured state)

## Screenshots

(Add screenshots here if you want—similar to Quick Clips.)

## Installation

### From the Stream Deck Marketplace (Pending Publication)

1. Open the Stream Deck application
2. Go to the Marketplace
3. Search for "One-Time"
4. Click Install

### Manual Installation (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/glmorgan/onetime.git
   cd onetime
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Link the plugin to Stream Deck:
   ```bash
   ln -s "$(pwd)/com.glmorgan.onetime.sdPlugin" \
     "$HOME/Library/Application Support/com.elgato.StreamDeck/Plugins/"
   ```

5. Restart Stream Deck (choose one):

   **Option 1:** Using CLI (requires `npm install -g @elgato/cli`)
   ```bash
   streamdeck restart com.glmorgan.onetime
   ```

   **Option 2:** Manually quit and reopen the Stream Deck application

## How It Works

### Basic Usage

1. Add a **One-Time Code** button to your Stream Deck from the Actions panel
2. Open the Property Inspector for that key
3. Enter your secret (Base32)
4. Press the key to output a code

### Output Modes

- **Copy to clipboard** (default)
- **Paste into active app**
  Paste mode uses `osascript` to simulate Cmd+V and requires Accessibility permissions.

### Visual States

The action uses states to change the key image:

| State | Icon | Meaning |
|------|------|---------|
| Unconfigured | `imgs/actions/otc/unconfigured` | No secret set |
| Invalid | `imgs/actions/otc/invalid` | Secret present but not valid Base32 |
| Configured | `imgs/actions/otc/onetime` | Secret set and valid |

### Button Settings

Each key has these settings in the Property Inspector:

- **TOTP Secret (Base32)**
- **Code Digits** (6 or 8)
- **Time Period** (15 / 30 / 60 seconds)
- **Output Mode** (clipboard or paste)

## Platform Support

- **macOS**: Supported and tested on macOS 12+

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

## Technical Details

- Built with TypeScript using the Elgato Stream Deck SDK (`@elgato/streamdeck`)
- TOTP generation via `otplib`
- Uses native macOS tooling for output (`pbcopy`, `osascript`)

## License

MIT

## Author

Glen Morgan

## Support

For bugs, feature requests, or questions, please visit the GitHub issues page:
https://github.com/glmorgan/onetime/issues
