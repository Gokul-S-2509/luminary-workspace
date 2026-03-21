<div align="center">

<h1>✦ Luminary</h1>

**A free, offline-first personal workspace — rich notes, kanban board, database & calendar views.**
**No account. No subscription. Runs entirely in your browser.**

[![License: MIT](https://img.shields.io/badge/License-MIT-7c6af5.svg)](https://opensource.org/licenses/MIT)
[![HTML](https://img.shields.io/badge/Built%20With-HTML%2FCSS%2FJS-f0b850.svg)](#)
[![No Backend](https://img.shields.io/badge/Backend-None-5cc896.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-a399ff.svg)](#contributing)

---


</div>

---

## 📖 Table of Contents

- [About](#about)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
  - [Pages & Sidebar](#pages--sidebar)
  - [Rich Text Editor](#rich-text-editor)
  - [Slash Command Menu](#slash-command-menu)
  - [Floating Toolbar](#floating-toolbar)
  - [Page Covers](#page-covers)
  - [Board View (Kanban)](#board-view-kanban)
  - [Database View (Table)](#database-view-table)
  - [Calendar View](#calendar-view)
  - [Export & Import](#export--import)
  - [Print / Save as PDF](#print--save-as-pdf)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Settings](#settings)
- [Contributing](#contributing)
- [License](#license)

---

## About

**Luminary** is a personal productivity workspace you fully own. It is a free alternative to tools like Notion — built with plain HTML, CSS, and JavaScript, with zero dependencies, zero backend, and zero cost.

Everything is saved to your browser's `localStorage`. Your data never leaves your device. You can back it up anytime with a single click and restore it on any device.

> *"Stop paying for tools that own your data. Start owning your workspace."*

---

## Features

### 📝 Rich Text Editor
- Block-based editor with headings, paragraphs, bullet lists, numbered lists, blockquotes, code blocks, tables, and dividers
- **`/` slash command menu** — type `/` anywhere to insert any block type instantly
- **Floating format toolbar** — select any text to bold, italic, underline, strikethrough, change color, or add a link
- Auto-save every 2 seconds — your work is never lost

### 🗂️ Pages & Sidebar
- Create **unlimited pages** with custom emoji icons and titles
- Choose from **6 page templates** — Blank, Meeting Notes, To-do List, Daily Journal, Project Plan, Brain Dump
- **Favorite** pages for quick access
- **Duplicate** or **delete** pages
- **Search** across all pages instantly
- Page history — navigate back and forward between pages

### 🖼️ Custom Page Covers
- Add a beautiful cover image to any page, stored **per page individually**
- Choose from **preset gradients** or **solid colors**
- **Upload your own image** (PNG, JPG, WEBP up to 5MB)
- Paste an **image URL** from the web
- Remove or change covers at any time

### ☷ Board View (Kanban)
- Visual kanban board with **4 columns** — To Do, In Progress, Done, Blocked
- **Drag and drop** cards between columns to update status
- Each card shows task name, priority badge, and due date
- **Delete cards** by hovering and clicking the ✕ button
- Add new cards directly from any column

### ⊟ Database View (Table)
- Spreadsheet-style view of all your tasks
- Columns: Task Name, Status, Priority, Due Date, Notes
- Color-coded **status badges** and **priority labels**
- **Delete rows** by hovering and clicking the trash icon
- Add new rows with the **+ New row** button

### 📅 Calendar View
- Monthly calendar showing all tasks pinned to their due dates
- Navigate between months with arrow buttons
- Click any date to instantly add a task on that day
- **Today** is highlighted automatically

### 💾 Export & Import Backup
- Export your **entire workspace** (all pages + all tasks) as a `.lmn` file — a structured JSON database file
- Import a `.lmn` backup on any device to restore everything exactly as it was
- **No cloud required** — your backup file is your cloud

### 🖨️ Print / Save as PDF
- Opens a clean, print-friendly version of the current page in a new tab
- Automatically triggers the browser's **print dialog**
- Use **"Save as PDF"** in the print dialog to get a beautiful PDF export

### ⚙️ Settings
- Change the **editor font** — Syne (default), Fraunces (serif), or Fira Code (monospace)
- Toggle between **centered** and **full-width** editor layout

### ⌨️ Keyboard Shortcuts
Full shortcut support for power users — see the [Keyboard Shortcuts](#keyboard-shortcuts) section.

---

## Project Structure

```
luminary-workspace/
├── index.html          ← Landing / marketing page
├── workspace.html      ← The actual workspace app
├── css/
│   └── style.css       ← All styles and design tokens
└── js/
    └── script.js       ← All application logic
```

- **`index.html`** — The landing page visitors see first. Links to the workspace.
- **`workspace.html`** — The full productivity app. This is where all the work happens.
- **`css/style.css`** — Every style rule, CSS variable, and responsive layout.
- **`js/script.js`** — Every function: page management, editor, views, export/import, modals, keyboard shortcuts.

---

## Getting Started

### Option 1 — Use it directly (no setup)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/your-username/luminary-workspace.git
   ```
2. Open **`workspace.html`** in any modern browser (Chrome, Firefox, Edge, Safari).
3. That's it. No install, no terminal, no server needed.

### Option 2 — Use the single bundled file

If you just want one file to carry around:

1. Download **`luminary.html`** from the repo
2. Open it in your browser
3. Everything is self-contained in that one file

### Option 3 — Deploy to Vercel (recommended for online access)

See the [Deploying to Vercel](#deploying-to-vercel) section below.

---

## How to Use

### Pages & Sidebar

| Action | How |
|---|---|
| Create a new page | Click **+ New Page** at the bottom of the sidebar, or press `Ctrl+N` |
| Open a page | Click its name in the sidebar |
| Rename a page | Click the page, then edit the title at the top |
| Change page icon | Click the emoji icon above the title |
| Favorite a page | Click the ⭐ button in the top bar |
| Duplicate a page | Hover over a page in the sidebar → click the copy icon |
| Delete a page | Hover over a page in the sidebar → click the trash icon |
| Search pages | Type in the search bar at the top of the sidebar |
| Collapse sidebar | Click the ☰ button or press `Ctrl+\` |

---

### Rich Text Editor

Just click inside the editor and start typing. The editor auto-saves every 2 seconds.

**Supported block types:**

| Block | How to insert |
|---|---|
| Paragraph | Default — just type |
| Heading 1, 2, 3 | Type `/h1`, `/h2`, `/h3` or use the slash menu |
| Bullet list | Type `/bullet` or use the slash menu |
| Numbered list | Type `/numbered` or use the slash menu |
| Blockquote | Type `/quote` or use the slash menu |
| Code block | Type `/code` or use the slash menu |
| Table | Type `/table` or use the slash menu |
| Divider | Type `/divider` or use the slash menu |

---

### Slash Command Menu

The slash command menu is the fastest way to insert content.

1. Place your cursor anywhere in the editor
2. Type **`/`**
3. A command palette appears — type to filter (e.g. `/h1`, `/code`, `/board`)
4. Click an item or use **↑ ↓ arrow keys** and press **Enter** to select
5. Press **Escape** to close without inserting

**Available commands:**

| Group | Commands |
|---|---|
| Text | Paragraph, Heading 1, Heading 2, Heading 3, Blockquote |
| Lists | Bullet List, Numbered List, Todo |
| Media & Code | Code Block, Divider, Table |
| Views | Board View, Database, Calendar |

> 💡 Typing `/board`, `/database`, or `/calendar` from inside the editor takes you directly to that view.

---

### Floating Toolbar

1. **Select any text** in the editor
2. A floating toolbar appears above your selection
3. Apply formatting instantly:

| Button | Action |
|---|---|
| **B** | Bold |
| *I* | Italic |
| U | Underline |
| ~~S~~ | Strikethrough |
| H1 / H2 / H3 | Convert to heading |
| List icons | Bullet or numbered list |
| Quote icon | Blockquote |
| Code icon | Code block |
| Link icon | Add hyperlink |
| Palette icon | Cycle text color |

---

### Page Covers

1. Hover over the top of any page — **Add Cover** button appears near the title
2. Click it to open the **Cover Picker**
3. Choose a tab:
   - **Gradients** — 8 dark gradient presets
   - **Colors** — 12 solid color presets
   - **Upload Image** — drag or click to upload a JPG/PNG/WEBP (max 5MB)
   - **Image URL** — paste any direct image link from the web
4. Click a swatch or hit **Apply** — the cover updates instantly
5. To **change** or **remove** a cover, hover over it and use the buttons that appear

> ⚠️ Each page stores its own cover independently — changing one page's cover does not affect any other page.

---

### Board View (Kanban)

1. Click **Board** in the sidebar, or type `/board` in the editor
2. Your tasks appear as cards in 4 columns: **To Do**, **In Progress**, **Done**, **Blocked**

**Managing cards:**

| Action | How |
|---|---|
| Add a card | Click **+ Add card** at the bottom of any column |
| Move a card | **Drag and drop** it to another column |
| Delete a card | Hover over a card → click the **✕** button (top right of card) |

Each card shows the task name, priority (High / Medium / Low), and due date.

---

### Database View (Table)

1. Click **Database** in the sidebar, or type `/database` in the editor
2. All tasks appear in a spreadsheet-style table

**Managing rows:**

| Action | How |
|---|---|
| Add a row | Click **+ New row** at the bottom |
| Delete a row | Hover over a row → click the **🗑** trash icon |

**Columns:**

| Column | Description |
|---|---|
| Task | Task name |
| Status | To Do / In Progress / Done / Blocked |
| Priority | High / Medium / Low |
| Due Date | Target completion date |
| Notes | Additional context |

---

### Calendar View

1. Click **Calendar** in the sidebar, or type `/calendar` in the editor
2. Tasks with due dates appear as events on their due date
3. Click **← →** to navigate between months
4. Click **Today** to jump back to the current month
5. Click any **date cell** to add a new task on that day

---

### Export & Import

#### Export (Back up your workspace)
1. Click **Export** in the top bar, or press `Ctrl+E`
2. A `.lmn` file downloads to your computer (e.g. `luminary-backup-2026-03-21.lmn`)
3. This file contains **all your pages and tasks** in a structured JSON format
4. Keep this file safe — it is your complete workspace backup

#### Import (Restore a backup)
1. Click **Import Backup** at the bottom of the sidebar
2. Select your `.lmn` backup file
3. Confirm the prompt — your workspace is restored instantly

> ⚠️ Importing replaces your current workspace. Export first if you want to keep your current data.

---

### Print / Save as PDF

1. Click **Print / PDF** in the top bar
2. A clean, styled version of the **current page** opens in a new tab
3. The browser print dialog opens automatically
4. Select **"Save as PDF"** as the destination to export a PDF
5. Or select a printer to print a physical copy

---

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + S` | Save current page |
| `Ctrl + K` | Focus search bar |
| `Ctrl + N` | New page |
| `Ctrl + E` | Export backup |
| `Ctrl + \` | Toggle sidebar |
| `Ctrl + B` | Bold selected text |
| `Ctrl + I` | Italic selected text |
| `Ctrl + Z` | Undo |
| `/` | Open slash command menu |
| `↑ ↓` | Navigate slash menu |
| `Enter` | Select slash menu item |
| `Escape` | Close menus / modals |

> Click the **⌨️** keyboard icon in the top bar to see the shortcuts panel anytime.

---

### Settings

Click the **⚙️** icon in the top bar to open Settings.

| Setting | Options |
|---|---|
| Workspace Name | Custom name for your workspace |
| Editor Font | Syne (default) · Fraunces (serif) · Fira Code (monospace) |
| Editor Width | Centered (max 800px) · Full Width |

---

### Steps

1. Push your code to GitHub (you're already doing this!)

2. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account

3. Click **"Add New Project"** → select your `luminary-workspace` repository

4. Vercel auto-detects it as a static site. No configuration needed.

5. Click **Deploy** — your site is live in ~30 seconds

6. Vercel gives you a free URL like:
   ```
   https://luminary-workspace.vercel.app
   ```

### Updating after changes

Every time you push to GitHub, Vercel automatically redeploys. No manual steps needed.

> 💡 Your data is still stored in `localStorage` per device — Vercel only hosts the files, not your notes. Use the **Export / Import** feature to move data between devices.

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — no build step needed, just edit the files
4. **Commit** with a clear message:
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a **Pull Request** on GitHub

### Ideas for contributions
- 🌙 Light mode theme
- 📱 Better mobile layout for the editor
- 🔍 Full-text search across all pages
- 🏷️ Tags and filters for tasks
- 📊 Task analytics dashboard
- 🌐 i18n / multi-language support

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License — Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, and/or sell
copies of the software, subject to including this copyright notice.
```

---

<div align="center">

Built with ♥ using plain HTML, CSS & JavaScript · No frameworks · No dependencies

**[⬆ Back to top](#)**

</div>
