# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Installation:**
```bash
npm install
```

**Run the bot:**
```bash
npm start  # Production mode
npm run test  # Development mode with nodemon (ignores config/ changes)
```

**Clear bot commands:**
```bash
npm run clean  # Removes all registered Discord slash commands
```

**Docker deployment:**
```bash
docker build -t clumsybot .
docker run -v ./config:/app/config clumsybot
```

## Architecture Overview

### Core Structure
- **index.js**: Main bot entry point handling Discord events and command routing
- **configuration.js**: Guild settings management with persistent JSON storage
- **channels.js**: Temporary voice channel tracking system
- **automod.js**: Webhook-based content moderation with configurable severity levels
- **userscores.js**: User moderation scoring system
- **webhook.js**: JWT-authenticated webhook utility for external integrations
- **cmd/**: Slash command modules with standardized structure

### Key Systems

**Command System:**
- Commands are auto-loaded from `cmd/` directory
- Each command exports `data` (SlashCommandBuilder) and `execute` function
- Commands can be marked as `test: true` for guild-only deployment
- Both slash commands and button/menu interactions are routed through the same system

**Guild Configuration:**
- Per-guild settings stored in `./config/guilds_settings.json`
- Manages welcome messages, default roles, temp channels, and automod settings
- Configuration persists through `configuration.js` module with get/set/save methods

**Temporary Voice Channels:**
- Users join special "creator" channels to spawn temporary rooms
- Three types: normal, private (invite-only), hidden (invisible to @everyone)
- Auto-cleanup when empty after 5-second delay
- Channel metadata tracked in `./config/temp_ids.json`

**AutoMod System:**
- Webhook integration with external moderation service at `n8n.stayclumsy.com`
- JWT-signed requests using Discord bot token as secret
- Response format: `{status: "ok|warning|danger", mean_lvl: "none|low|medium|high|severe", response: "explanation"}`
- Configurable debug levels control which alerts are sent to moderation channels
- Moderator actions (delete/kick/ban) update user scores based on severity

**Configuration Requirements:**
- Create `./config/.env` with:
  - `TOKEN=` (Discord bot token)
  - `TEST_IDS=` (comma-separated guild IDs for test commands)
- Config directory is Docker volume-mounted for persistence

## Special Features

**Easter Eggs:**
- Responds "feur" to messages ending in "quoi"
- Responds "deux" to messages ending in "hein"
- Text processing removes special characters and deduplicates letters

**Voice State Handling:**
- Automatic temporary channel creation when users join creator channels
- Cleanup of empty temporary channels
- Support for different privacy levels

**Member Events:**
- Welcome/goodbye messages with embed formatting
- Automatic role assignment for new members (if configured)
- Uses guild system channel for announcements