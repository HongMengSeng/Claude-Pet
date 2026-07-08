# 🤖 Claude Pet

A cross-platform desktop pet for Claude Code users. A tiny robot companion that lives on your desktop — works with you, slacks off when you're away, and holds up a sign during code review.

![Claude Pet](https://img.shields.io/badge/version-1.0.0-orange) ![platforms](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue) ![electron](https://img.shields.io/badge/electron-32%2B-9feaf9)

## ✨ Features

- 🖥️ **Cross-platform** — Windows, macOS, Linux via Electron
- 💻 **Working State** — Robot types at a desk, code particles float by
- 😴 **Idle Actions** — Random animations: snoring (Zzz), 🐟 "touching fish", ☕ coffee break, 🔧 self-check
- 🏴 **Review Mode** — Holds a yellow "⏳ Review Pending" sign, celebrates when approved ✅
- 🎒 **Accessories** — 5 customizable slots (head/ears/face/neck/hand), import your own PNG/SVG
- 🔗 **Claude Code Integration** — Auto-launches when you start the `claude` CLI
- 🎨 **Zero Dependencies** — Vanilla JS + Canvas 2D, no frameworks

## 🚀 Quick Start

```bash
git clone https://github.com/HongMengSeng/Claude-Pet.git
cd Claude-Pet
npm install
npm start
```

## 🔗 Claude Code Integration

Add hook configuration to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "StartSession": [{
      "command": "node /absolute/path/to/claude-pet/hook/claude-code-hook.js",
      "env": { "CLAUDE_HOOK_TYPE": "session_start" }
    }],
    "StopSession": [{
      "command": "node /absolute/path/to/claude-pet/hook/claude-code-hook.js",
      "env": { "CLAUDE_HOOK_TYPE": "session_end" }
    }]
  }
}
```

Then launch the pet before starting Claude Code:

```bash
npm start &    # Start the pet
claude         # Start Claude Code — pet auto-enters working state
```

## 🎮 Controls

| Action | How |
|--------|-----|
| **Open Settings** | Right-click the robot |
| **Move Pet** | Drag the robot (click-through disabled in settings) |
| **Switch States** | Settings panel → State Control buttons |
| **Import Accessory** | Settings panel → Accessories → Import |

## 🏗️ Build

```bash
npm run build:win      # Windows .exe (NSIS installer)
npm run build:mac      # macOS .dmg
npm run build:linux    # Linux .AppImage
npm run build:all      # All platforms
```

Outputs go to `dist/`.

## 📁 Project Structure

```
claude-pet/
├── electron/
│   ├── main.js          # Electron main process + HTTP server
│   └── preload.js       # Context bridge API
├── src/
│   ├── index.html       # Entry HTML
│   ├── css/pet.css      # Styles + settings panel
│   └── js/
│       ├── pet-core.js  # Robot drawing (Canvas 2D)
│       ├── states.js    # State machine
│       ├── animations.js# Animation loop + states
│       ├── accessories.js# Accessory slot system
│       ├── settings.js  # Settings panel + persistence
│       └── app.js       # Entry point, wires everything
├── hook/
│   ├── claude-code-hook.js    # Hook script
│   └── settings-example.json  # Example hook config
├── .claude/
│   ├── settings.json   # Project settings
│   └── skills/         # Custom AI dev skills
├── CLAUDE.md           # Project guide for AI agents
└── package.json
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 32+ |
| Rendering | Canvas 2D + CSS |
| Comms | Local HTTP (port 18923) |
| Storage | localStorage + JSON |
| Build | electron-builder |

## 📄 License

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
