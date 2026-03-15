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
| **Auth** | 1 | OAuth setup and status |

**39 tools total.**

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Download the gws binary

```bash
pnpm run download-binaries
```

This downloads pre-built `gws` binaries for macOS (arm64, x64) and Windows (x64) into `bin/`.

### 3. Build

```bash
pnpm run build
```

### 4. Start the server

```bash
node server/index.js
```

The MCP server starts on `http://localhost:37778/mcp` (override with `PORT` env var).

### 5. Authenticate

Once connected, use the `gws_auth_setup` tool to authenticate with Google via OAuth. This opens a browser window for login.

## Configuration

### Claude Desktop

Add to your Claude Desktop MCP config:

```json
{
  "mcpServers": {
    "google-workspace": {
      "type": "streamable-http",
      "url": "http://localhost:37778/mcp"
    }
  }
}
```

### Claude Code

```bash
claude mcp add google-workspace --transport http http://localhost:37778/mcp
```

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `37778` | HTTP server port |

## Architecture

```
src/
├── index.ts              # MCP server + HTTP transport
├── gws-client.ts         # Wrapper around the gws CLI binary
└── tools/
    ├── response.ts       # Shared response helpers
    ├── auth.ts           # OAuth setup
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

## Development

```bash
pnpm run dev    # Watch mode — recompiles on change
```

## License

MIT
