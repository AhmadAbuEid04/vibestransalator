# vibestranslator

vibestranslator is a hackathon Chrome extension prototype for Instagram Web. It helps users discover posts from outside their own region by layering in translated captions and short cultural context notes.

This project is intentionally Instagram-inspired and does not rely on the official Instagram API. The demo is designed to be local, fast to run, and easy for a small team to extend during a hackathon.

## What it does

- lets the user choose a home region and preferred language
- stores settings with `chrome.storage.local`
- injects a lightweight companion overlay on `instagram.com`
- includes a built-in demo feed with seeded posts from multiple regions
- hides or de-emphasizes posts from the user's own region
- reveals a short context explanation with a single click

## File structure

```text
.
├── assets/
├── content.css
├── content.js
├── data/
│   └── posts.json
├── demo/
│   ├── feed.css
│   ├── feed.html
│   └── feed.js
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
└── README.md
```

## Load the extension in Chrome

1. Open Chrome and go to `chrome://extensions`.
2. Turn on `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder:
   `/Users/ahmad0512/Documents/New project`

## Open the demo feed

1. Click the `vibestranslator` extension icon in Chrome.
2. Set your home region, preferred language, and whether to hide your region.
3. Click `Open demo feed`.

The demo page runs from inside the extension, so it is reliable even if Instagram changes its page structure.

## Edit sample posts

All seeded content lives in [data/posts.json](/Users/ahmad0512/Documents/New project/data/posts.json).

Each post includes:

- `region`
- `language`
- `topic`
- `originalCaption`
- `translatedCaption`
- `contextNote`
- `imageStyle`

## Hackathon teammate notes

- Popup and settings live in [popup.js](/Users/ahmad0512/Documents/New project/popup.js)
- Instagram overlay logic lives in [content.js](/Users/ahmad0512/Documents/New project/content.js)
- The judge-safe demo feed lives in [demo/feed.js](/Users/ahmad0512/Documents/New project/demo/feed.js)
- Seeded content lives in [data/posts.json](/Users/ahmad0512/Documents/New project/data/posts.json)

## Good next steps

- Add a smarter region detection pass for live Instagram posts
- Swap seeded translations for real AI responses
- Let users pin favorite regions or topics
- Compare how the same topic is discussed across multiple regions
- Add a compact "why am I seeing this?" explanation
