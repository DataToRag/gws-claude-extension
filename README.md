# Google Workspace MCP Extension for Claude

A [Model Context Protocol](https://modelcontextprotocol.io/) server that gives Claude access to Google Workspace — Gmail, Calendar, Drive, Contacts, Sheets, Docs, Slides, and 100+ APIs via the [gws CLI](https://github.com/googleworkspace/cli).

## Tools

| Service | Tools | Operations |
|---------|-------|------------|
| **Gmail** | 7 | send, reply, forward, triage, read, search, list |
| **Calendar** | 6 | list events, get event, create, update, delete, freebusy |
| **Contacts** | 7 | search, get, list, create, update, delete, directory search |
| **Drive** | 4 | search, upload, download, share |
| **Sheets** | 5 | read, update, append, create, delete |
| **Docs** | 4 | get, write, batch update, delete |
| **Slides** | 4 | get, create, batch update, delete |
| **Generic** | 1 | `gws_run` — escape hatch for any GWS API |
| **Auth** | 1 | OAuth login and status |

**39 tools total.**

## Setup (Extension — Claude Desktop)

### 1. Create a Google Cloud project

Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project (or use an existing one).

### 2. Enable Google Workspace APIs

Enable each API you plan to use in your project. Click the links below and hit **Enable** on each page (replace `YOUR_PROJECT_ID` with your GCP project ID):

- [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
- [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
- [Google Docs API](https://console.cloud.google.com/apis/library/docs.googleapis.com)
- [Google Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)
- [Google Slides API](https://console.cloud.google.com/apis/library/slides.googleapis.com)
- [People API](https://console.cloud.google.com/apis/library/people.googleapis.com) (for contacts)

### 3. Configure OAuth consent screen

Go to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent):

1. Select **External** user type
2. Fill in the app name (e.g. "Google Workspace CLI") and your email
3. Save and continue through all screens
4. Under **Test users**, click **Add users** and add your Google account email

### 4. Create OAuth credentials

Go to [Credentials](https://console.cloud.google.com/apis/credentials):

1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Desktop app**
3. Click **Create**
4. Copy the **Client ID** and **Client Secret**

### 5. Configure OAuth credentials

Set environment variables so the extension can find your OAuth credentials:

```bash
# Add to your shell profile (~/.zshrc, ~/.bashrc, etc.)
export GWS_OAUTH_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
export GWS_OAUTH_CLIENT_SECRET="YOUR_CLIENT_SECRET"
```

Restart your terminal (or `source ~/.zshrc`) so Claude Desktop picks up the variables.

### 6. Build the extension

```bash
pnpm install
pnpm run build
pnpm run build:extension
```

This produces `google-workspace.mcpb`.

### 7. Install in Claude Desktop

Open Claude Desktop → Settings → Extensions → Install from file → select `google-workspace.mcpb`.

When the extension loads for the first time, a browser window opens automatically for Google OAuth login. Sign in and authorize the app. After that, all tools are ready to use.

> **Note:** If your app is in testing mode (unverified), you'll see a "Google hasn't verified this app" warning. Click **Advanced** → **Go to \<app name\> (unsafe)** to proceed. This is safe for personal use.

## Setup (HTTP Server — Claude Code / standalone)

### 1. Complete steps 1–5 above

### 2. Install and build

```bash
pnpm install
pnpm run build
```

### 3. Authenticate

With the env vars from step 5 set, run:

```bash
./bin/gws-aarch64-apple-darwin/gws auth login -s drive,gmail,sheets,calendar,docs,slides
```

### 4. Start the server

```bash
node server/index.js
```

The MCP server starts on `http://localhost:39147/mcp` (override with `PORT` env var).

### 5. Connect Claude Code

```bash
claude mcp add google-workspace --transport http http://localhost:39147/mcp
```

Or add to Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "google-workspace": {
      "type": "streamable-http",
      "url": "http://localhost:39147/mcp"
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `39147` | HTTP server port |
| `GWS_OAUTH_CLIENT_ID` | — | OAuth client ID (alternative to hardcoding in source) |
| `GWS_OAUTH_CLIENT_SECRET` | — | OAuth client secret (alternative to hardcoding in source) |

## Architecture

```
src/
├── create-server.ts      # Shared MCP server factory
├── extension.ts          # Stdio entry point (.mcpb extension)
├── index.ts              # HTTP entry point (standalone server)
├── gws-client.ts         # Wrapper around the gws CLI binary
└── tools/
    ├── response.ts       # Shared response helpers
    ├── auth.ts           # OAuth login
    ├── gmail.ts          # Gmail tools
    ├── calendar.ts       # Calendar tools
    ├── contacts.ts       # Contacts / People API tools
    ├── drive.ts          # Drive tools
    ├── sheets.ts         # Sheets tools
    ├── docs.ts           # Docs tools
    ├── slides.ts         # Slides tools
    ├── generic.ts        # Generic gws_run fallback
    └── index.ts          # Tool registry
```

The server wraps the [`gws` CLI](https://github.com/googleworkspace/cli) binary, which handles OAuth token management and API discovery. Each tool either uses `client.helper()` for high-level CLI commands or `client.api()` for direct Google API calls.

The extension (`extension.ts`) runs via stdio for Claude Desktop `.mcpb` bundles. The HTTP server (`index.ts`) runs as a standalone process for Claude Code or other MCP clients.

## Development

```bash
pnpm run dev    # Watch mode — recompiles on change
```

## License

MIT
