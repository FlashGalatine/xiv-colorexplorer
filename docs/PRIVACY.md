# XIV Dye Tools Privacy Guide

XIV Dye Tools is a purely client-side application. All tools run entirely in your browser; no uploaded images, sampled colors, or configuration data is transmitted to our servers.

## Image Handling

- Uploaded images never leave your device. They are processed locally using the Canvas API.
- Temporary image data is discarded as soon as you refresh, close the tab, or click “Clear Image”.
- Clipboard pastes and drag-and-drop uploads are treated the same way—processed locally and never uploaded.

## Local Storage

We store only lightweight preferences in `localStorage` (theme choice, harmony filter state, companion dye count, etc.). You can clear these at any time via your browser settings.

## Network Access

The only external network calls are:

1. **Universalis API** (optional): Fetches market-board prices when you enable the “Show Prices” toggle.
2. **Google Fonts CDN**: Loads the Outfit, Inter, and JetBrains Mono fonts.

No other third-party trackers, analytics scripts, or telemetry endpoints are used.

## How to Verify

1. Open DevTools → Network tab → Enable “Preserve log”.
2. Use the Color Matcher, Harmony Explorer, or other tools.
3. Observe that no image uploads occur; only font and Universalis requests appear.

## Questions?

If you have privacy questions or suggestions, open an issue on GitHub or chat with us on Discord. We’re happy to document additional guarantees if it helps the community feel safe using the tools. 

