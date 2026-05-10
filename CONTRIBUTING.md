# Contributing to Harshal World

Thank you for your interest in contributing! Please follow these guidelines to keep the codebase consistent and high-quality.

## Getting Started

1. **Fork** the repository and create your branch from `main`.
2. Make your changes in the branch.
3. Open a **Pull Request** with a clear title and description.

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | All HTML markup and screen layouts |
| `style.css` | Styles, themes, and animations |
| `script.js` | All game logic, state management, and UI behaviour |

## Coding Standards

- **JavaScript**: Keep to the existing minified-inline style for small helpers; use readable multi-line style for larger functions.
- **HTML escaping**: Any user-supplied data rendered into `innerHTML` **must** be passed through `escapeHtml()` to prevent XSS.
- **State persistence**: Read/write application state only through `STATE`, `saveState()`, and `loadState()`. Use `debouncedSaveState()` for high-frequency events (e.g., sliders).
- **Audio**: Always call `getAudio()` from within a user-gesture handler; never at module load time.
- **Particle system**: Use `startParticles()` / `stopParticles()` when entering/leaving the game screen to conserve resources.
- **No blocking dialogs**: Avoid `alert()`, `confirm()`, and `prompt()`. Use `showToast()` for notifications and `showConfirmModal()` for confirmations.
- **Avatar images**: Always attach an `onerror` handler pointing to `AVATAR_FALLBACK` when setting avatar `src` attributes dynamically.

## Adding a New Game

1. Add a new entry to `GAMES` in `script.js` with `start()`, `loop()`, and any cleanup logic.
2. Add a corresponding card in `index.html` (both the Popular and All-Games grids as appropriate).
3. Add a `bestScores` key for the new game in the `STATE` object.
4. Update `addToLeaderboard` calls to pass the correct game name string.
5. If the game needs mobile controls, add a `.mobile-controls` div to `index.html` and map it in `showMobileControls()`.

## Bug Reports

- Search existing issues before opening a new one.
- Include browser/device info and steps to reproduce.
- Screenshots or screen recordings are very helpful.

## Pull Request Checklist

- [ ] My changes are scoped to the issue — no unrelated formatting or refactoring.
- [ ] User-supplied strings are HTML-escaped before being set via `innerHTML`.
- [ ] Any new `setInterval` / `requestAnimationFrame` loops are tracked and cleared when no longer needed.
- [ ] I have tested the change in at least one modern browser (Chrome / Firefox / Safari).
- [ ] The game still works after my change (no console errors).

## License

By contributing, you agree that your contributions will be licensed under the same terms as the project. See [`LICENSE`](LICENSE) for details.
