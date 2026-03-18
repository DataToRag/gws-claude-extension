import type { GwsClient } from "../gws-client.js";

export const authTools = [
  {
    name: "gws_auth_setup",
    description:
      "Authenticate with Google Workspace. Opens a browser for OAuth login. Call this before using any other Google Workspace tools.",
    inputSchema: {
      type: "object" as const,
      properties: {
        action: {
          type: "string",
          enum: ["login", "status"],
          description:
            '"login" to authenticate via browser (default), "status" to check current authentication state.',
        },
        services: {
          type: "string",
          description:
            'Comma-separated services to request access for (e.g. "drive,gmail,sheets"). Limits OAuth scopes to avoid hitting the 25-scope cap for unverified apps.',
        },
      },
      required: [] as string[],
    },
    annotations: { destructiveHint: true, readOnlyHint: false },
  },
];

export async function handleAuth(
  client: GwsClient,
  args: Record<string, unknown>
) {
  const action = (args.action as string) || "login";

  if (action === "status") {
    const result = await client.authStatus();
    return {
      content: [
        {
          type: "text" as const,
          text: result.success
            ? `Authenticated.\n${JSON.stringify(result.data, null, 2)}`
            : "Not authenticated. Use gws_auth_setup to log in (opens browser).",
        },
      ],
    };
  }

  const services = args.services as string | undefined;
  const result = await client.authLogin(services);
  return {
    content: [
      {
        type: "text" as const,
        text: result.success
          ? "Authentication successful! You can now use Google Workspace tools."
          : `Authentication failed.\n${result.stderr}`,
      },
    ],
  };
}
