# Harshal World

> A browser-based arcade hub built with vanilla HTML, CSS, and JavaScript.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7C3AED?style=flat-square)](https://harshalkurrey.github.io/Harshal-World/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## Overview

**Harshal World** is a lightweight arcade gaming hub that brings multiple browser games together in a single interactive experience.

Players can create a profile, choose an avatar and difficulty level, play games, earn XP, unlock achievements, collect coins, track high scores, and customize the experience with different themes.

## Games

| Game | Type |
| --- | --- |
| 🚀 Space Shooter | Action |
| 🐦 Flappy Bird | Arcade |
| 🐻 Whack a Bear | Arcade |
| ☄️ Asteroid Dodge | Action |
| 🦕 Dino Jump | Endless Runner |
| 🧟 Zombie Shooter | Action |
| 🐍 Snake Game | Arcade |

## Features

- 🎮 Multiple browser-based arcade games
- 🏆 High scores and leaderboard
- ⭐ XP and player progression
- 🎖️ Unlockable achievements
- 🪙 Daily coin rewards
- 🎨 Custom avatars
- 🌌 Multiple visual themes
- 🔊 Sound effects and volume controls
- 📊 Player statistics and game history
- 🎡 Spin-to-play game selection
- ⏸️ Pause, restart, and game-over controls
- 📱 Responsive mobile controls
- 💾 Local progress persistence with `localStorage`

## Tech Stack

- **HTML5** — Structure and game interface
- **CSS3** — Responsive UI, themes, animations, and visual effects
- **JavaScript** — Game logic, state management, interactions, audio, and canvas rendering
- **Canvas API** — Real-time game rendering
- **LocalStorage** — Persistent player progress
- **DiceBear API** — Dynamic avatar generation

## Project Structure

```text
Harshal-World/
├── .github/
│   └── workflows/
│       └── auto-label.yml
├── assets/
│   ├── deep-sea.png
│   ├── harshal-world-logo.png
│   ├── pixel-dungeon-bg.png
│   └── sunset-circuit-bg.png
├── .gitignore
├── LICENSE
├── README.md
├── index.html
├── script.js
└── style.css
````

## Getting Started

### Clone the repository

```bash
git clone https://github.com/harshalkurrey/Harshal-World.git
cd Harshal-World
```

### Run locally

No build step or package installation is required.

Simply open `index.html` in a modern web browser.

For the best development experience, use a local server such as the **Live Server** extension in VS Code.

## How to Play

1. Enter your player name.
2. Choose an avatar.
3. Select your experience level.
4. Choose a game from the arcade hub.
5. Play, score points, and earn XP.
6. Unlock achievements and improve your high scores.

Keyboard and touch controls vary by game. Each supported game provides an in-game tutorial where appropriate.

## Progression

Your progress is tracked through:

* **XP** — Earned by playing games.
* **Ranks** — Progress from `ROOKIE` to `LEGEND`.
* **Coins** — Earned through daily rewards.
* **High Scores** — Stored separately for each game.
* **Combos** — Build consecutive successful actions.
* **Achievements** — Complete milestones to unlock rewards.
* **Leaderboard** — Keep track of your best scores.

Player progress is stored locally in the browser using `localStorage`.

## Themes

Harshal World includes multiple visual themes:

* 🌌 Default
* 🌊 Deep Sea
* 🌅 Sunset
* 🟩 Pixel

Use the theme control in the arcade hub to switch between them.

## Contributing

Contributions are welcome.

### 1. Fork the repository

Create your own fork of the project on GitHub.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/Harshal-World.git
cd Harshal-World
```

### 3. Create a branch

```bash
git checkout -b feature/your-feature
```

### 4. Make your changes

You can contribute by:

* Adding a new game
* Improving existing gameplay
* Fixing bugs
* Improving mobile responsiveness
* Adding UI or accessibility improvements
* Improving performance
* Adding new themes
* Improving documentation

### 5. Commit your changes

```bash
git add .
git commit -m "Add: your change"
```

### 6. Push your branch

```bash
git push origin feature/your-feature
```

### 7. Open a Pull Request

Describe what you changed and why. Keep pull requests focused and make sure existing functionality continues to work.

## Development Guidelines

* Keep the project dependency-light.
* Prefer vanilla JavaScript over unnecessary libraries.
* Maintain responsive behavior across desktop and mobile.
* Keep game logic modular and readable.
* Test gameplay and controls before submitting changes.
* Avoid committing generated files or personal configuration.

## License

This project is licensed under the terms of the [LICENSE](LICENSE) file.

## Live Demo

**Play Harshal World:**
[https://harshalkurrey.github.io/Harshal-World/](https://harshalkurrey.github.io/Harshal-World/)

```

This version also aligns the README with the actual implementation: the code defines seven games, XP/rank progression, achievements, daily rewards, themes, persistent state, and mobile controls. :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3} :contentReference[oaicite:4]{index=4} :contentReference[oaicite:5]{index=5}

**One small consistency fix:** your UI currently says **“WHACK A BEAR”**, while the JavaScript game-name map uses **“WHACK-A-MOLE.”** :contentReference[oaicite:6]{index=6} :contentReference[oaicite:7]{index=7} I used **Whack a Bear** in the README because that is what players see in the game hub.
```
