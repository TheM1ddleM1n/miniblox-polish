<div align="center">

# ✨ Miniblox Polish
### A lightweight Tampermonkey enhancement suite for Miniblox.io

![Version](https://img.shields.io/badge/version-1.4-00ff41?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ff41?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Miniblox.io-00ff41?style=for-the-badge)

**[Install](#-install) • [Features](#-features) • [Changelog](#-changelog) • [Report Bug](../../issues/new?labels=bug)**

</div>

---

## ⚡ Install

1. Install [Tampermonkey](https://www.tampermonkey.net/)
2. Click **[→ Install Miniblox Polish](#)** *(paste your raw GitHub URL here)*
3. Open [Miniblox.io](https://miniblox.io) and enjoy

---

## ✨ Features

### Loading Screen
| Feature | Description |
|---------|-------------|
| 🟢 Matrix rain | Animated green katakana/hex rain in the background |
| 📊 Loading bar | 13 staged progress bar with status labels |
| 💡 Tip rotator | 30 gameplay tips rotating every 4 seconds |
| 🔢 Auto version | Detects the current Miniblox version automatically |

### Always On
| Feature | Description |
|---------|-------------|
| ❄️ No snowflakes | Removes all snowflake particle effects instantly and continuously |
| 💬 No Discord banner | Hides the Discord promo before the page even renders |
| 🎮 No party button | Removes the Party button from the nav and blocks invites at the RPC level |
| 📐 Spaced nav | Adds breathing room between the left sidebar buttons — survives React re-renders |

---

## 📝 Changelog

### [1.4] — Nav Spacing
- Nav buttons now spaced via JS sweep instead of CSS, so it survives React re-renders

### [1.2] — Nav Spacing (CSS)
- Added margin between left sidebar nav buttons

### [1.1] — Snowflakes + Version Detection
- Snowflake hiding baked into the loader from frame one
- Auto-detects Miniblox version from the page footer — no more hardcoded version string

### [1.0] — Initial Release
- Matrix loading screen with 13 stages and 30 tips
- Party button hidden and RPC invite methods blocked
- Discord banner removed via CSS and DOM sweep
- Snowflake particles suppressed

---

## 🛠️ How it works

Miniblox is built on React with Chakra UI. Standard CSS tweaks get wiped on re-render, so
everything here uses a `MutationObserver` + 100ms sweep interval to re-apply changes the
moment React updates the DOM. Party invites are blocked at the RPC level by patching
`game.party.invoke` directly on the game object exposed via the React fiber tree.

---

## 👥 Credits

| Role | Contributor |
|------|-------------|
| Author | [@TheM1ddleM1n](https://github.com/TheM1ddleM1n) |
| Inspired by | [Waddle](https://github.com/TheM1ddleM1n/Waddle) |

---

<div align="center">

</div>
