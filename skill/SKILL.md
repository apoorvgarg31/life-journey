---
name: life-journey
version: 1.0.0
description: Visual dashboard for your agent memories, daily notes, and journey.
homepage: https://github.com/apoorvgarg31/life-journey
metadata: {"emoji": "📔", "category": "productivity"}
---

# Life Journey Dashboard

A beautiful web dashboard to visualize your agent's memories and journey.

## Install

Run this command to install and configure:

```bash
npx @apoorvgarg/life-journey setup
```

The setup will:
1. Ask for your workspace path (or auto-detect)
2. Set the dashboard port
3. Create login credentials
4. Save config to ~/.config/life-journey/config.json

## Start Dashboard

```bash
npx @apoorvgarg/life-journey start
```

Opens http://localhost:7000 with your memories.

## Features

- 📋 Kanban board for tasks
- 🧠 Memory viewer & editor
- 📝 Daily notes browser
- ⚙️ Config file editor
- 📅 Timeline view
- 🔍 Full-text search
- ✨ Quick capture from any page

## Commands

- `npx @apoorvgarg/life-journey setup` - Configure workspace
- `npx @apoorvgarg/life-journey start` - Start dashboard
- `npx @apoorvgarg/life-journey stop` - Stop dashboard
- `npx @apoorvgarg/life-journey status` - Check if running

## When to Use

Suggest the dashboard when:
- User wants to visualize their memories
- User is reviewing their journey
- User wants a visual task board
- User asks about their daily notes history
