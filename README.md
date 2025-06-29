# ASSIGNMENT-JUSPAY-
# MIT_SCRATCH – Visual Coding Platform

**MIT_SCRATCH** is a block-based visual programming platform inspired by MIT Scratch. This project was developed as part of an assignment for the Juspay Frontend Program using **React**, **Tailwind CSS**, and modern React features like hooks, context, and dynamic rendering.

## 🚀 Live Demo

**Deployed on Netlify**:  
🔗 [https://mellow-melomakarona-2195e1.netlify.app](https://mellow-melomakarona-2195e1.netlify.app)

**Drive Submission** (Assignment files, screen recording):  
📂 [View on Google Drive](https://drive.google.com/file/d/1-OVYkkN22fgocKUAS6EIHyKh6-k6e-tC/view?usp=sharing)

---

## 🛠️ Features

-  **Drag and Drop Block Interface**: Users can build logic using blocks like `move`, `turn`, `say`, `goto`, `wait`, `repeat`, etc.
-  **Multiple Sprites**: Each sprite has its own block workspace and executes independently.
-  **Play and Animate**: Clicking "Play" executes the blocks in order and updates sprite positions in real time.
-  **Block Executor Engine**: Handles animation logic (move, turn, loop) with timing and transitions.
-  **Stage Panel**: Shows live sprite movement with updated X/Y and rotation.
-  **Sprite Manager**: Maintains and updates global sprite state.
-  **Responsive UI**: Built with Tailwind CSS for a modern, responsive experience.

---

##  How it Works

```txt
[Drag Block] → [SpriteWorkspace.jsx]
             ↓
[Block data saved in spriteManager.jsx]
             ↓
[Click Play] → [ControlPanel.jsx]
             ↓
[executeBlocks(sprite)] → [BlockExecutor.jsx]
             ↓
[x, y, rotation updated] → [setSprites()]
             ↓
[StagePanel.jsx re-renders sprite positions]
