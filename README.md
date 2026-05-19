# Code Blue Defense

Code Blue Defense is a browser-based hospital tower defense game built as a static HTML, CSS, and JavaScript prototype.

## Problem / Use Case

This repo is a small playable game MVP. It uses a hospital theme to make tower-defense mechanics readable: place staff roles, stop incoming pathogen waves, and manage credits, lives, and wave timing.

It is a game prototype only. It is not a clinical simulation or medical tool.

## Key Features

- Five-wave tower defense loop with victory and game-over states
- Build pads for four staff roles: Nurse, Doctor, Pharmacist, and Infection Control
- Four enemy types with different health, speed, reward, and damage values
- Credits, lives, score, wave progress, and status HUD
- Speed toggle and optional auto-start for the next wave
- Canvas-rendered board with HTML controls, build menu, and end-of-game modal

## Tech Stack

- Static HTML
- CSS
- Vanilla JavaScript
- Canvas 2D rendering
- Google Fonts loaded from the page

There is no package manager, build step, backend, or database in the current repo.

## Run Locally

Open `index.html` directly in a browser, or serve the folder with a simple static server:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Current Status

This is a standalone MVP. Game state resets on refresh, balancing is hard-coded in `script.js`, and there are no automated tests or deployment scripts in the repo.
