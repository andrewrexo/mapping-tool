# Isometric Map Editor

A powerful and intuitive map editor built with Svelte 5 and Phaser 3. This tool allows users to create, edit, and export custom isometric maps for game development or other creative projects.

## Features

- Multiple layers support
- Tile animations
- Undo/Redo functionality
- Map export and import with support for .json format.
- Customizable tools (Brush, Eraser, Fill)
- Responsive design & mobile friendly.

## Getting Started

### Prerequisites

- bun `curl -fsSL https://bun.sh/install | bash`
- art assets / isometric tilesets & objects

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/andrewrexo/mapping-tool.git
   cd map-editor
   ```

2. Install dependencies:

   ```
   bun install
   ```

3. Start the development server:

   ```
   bun dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development

This project uses the Svelte 5 (now out of RC!) with runes syntax for UI components, and Phaser 3 for all canvas-relate functionality.

Key files and directories:

- `src/game/`: Contains Phaser scenes and game logic
- `src/lib/`: Reusable components and utilities
- `src/routes/`: Svelte routes and pages
