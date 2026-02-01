# 📔 Life Journey

A beautiful web dashboard to visualize your AI agent's memories, tasks, and daily notes.

![Life Journey Dashboard](https://via.placeholder.com/800x400?text=Life+Journey+Dashboard)

## Features

- 📋 **Kanban Board** - Track tasks with drag-and-drop
- 🧠 **Memory Viewer** - Browse and edit your agent's MEMORY.md
- 📝 **Daily Notes** - View timestamped daily entries
- ⚙️ **Config Editor** - Edit SOUL.md, AGENTS.md, and more
- 📅 **Timeline View** - See your journey over time
- 🔍 **Full-text Search** - Find anything across all files
- ✨ **Quick Capture** - Add notes from any page

## Quick Start

```bash
# Interactive setup
npx @apoorvgarg/life-journey setup

# Start the dashboard
npx @apoorvgarg/life-journey start
```

The setup wizard will:
1. Ask for your workspace path (auto-detects if possible)
2. Set the dashboard port (default: 7000)
3. Create your login credentials

## Commands

| Command | Description |
|---------|-------------|
| `npx @apoorvgarg/life-journey setup` | Configure your workspace interactively |
| `npx @apoorvgarg/life-journey start` | Start the dashboard server |
| `npx @apoorvgarg/life-journey stop` | Stop the dashboard server |
| `npx @apoorvgarg/life-journey status` | Check if dashboard is running |

### Options

```bash
# Start on a different port
npx @apoorvgarg/life-journey start --port 8080

# Start without opening browser
npx @apoorvgarg/life-journey start --no-open
```

## Configuration

Config is stored at `~/.config/life-journey/config.json`:

```json
{
  "workspacePath": "/path/to/your/workspace",
  "port": 7000,
  "theme": "dark",
  "auth": {
    "username": "your-username",
    "passwordHash": "..."
  },
  "jwtSecret": "..."
}
```

To reconfigure, just run `setup` again.

## Workspace Structure

Life Journey expects this structure in your workspace:

```
your-workspace/
├── MEMORY.md          # Long-term memory
├── SOUL.md            # Agent identity (optional)
├── AGENTS.md          # Workspace rules (optional)
├── HEARTBEAT.md       # Periodic tasks (optional)
├── USER.md            # User profile (optional)
├── TOOLS.md           # Tool notes (optional)
├── IDENTITY.md        # Identity file (optional)
└── memory/            # Daily notes directory
    ├── 2025-01-15.md
    ├── 2025-01-16.md
    └── ...
```

## For Clawdbot/OpenClaw Users

This dashboard is designed to work seamlessly with [Clawdbot](https://github.com/opnclaw/clawdbot) workspaces. Point it at your `~/clawd` directory and you're good to go!

### Install as a Skill

```bash
# In Clawdbot
/skill install https://life-journey.dev/skill.md
```

## Development

```bash
# Clone the repo
git clone https://github.com/apoorvgarg31/life-journey
cd life-journey

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Security

- Passwords are hashed before storage
- JWT tokens expire after 7 days
- All config is stored locally in `~/.config/life-journey/`
- No data is sent to external servers

## License

MIT © [Apoorv Garg](https://github.com/apoorvgarg31)
