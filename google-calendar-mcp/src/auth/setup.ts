#!/usr/bin/env node

import { OAuth2Client } from "google-auth-library";
import { createServer } from "http";
import open from "open";
import { saveTokens, getTokenPath } from "./token-store.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];

const REDIRECT_PORT = 3000;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;

async function authorize(): Promise<void> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      "Error: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables are required"
    );
    console.error("");
    console.error("Set them in your environment or .mcp.json:");
    console.error('  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"');
    console.error('  GOOGLE_CLIENT_SECRET="your-client-secret"');
    process.exit(1);
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force consent to always get refresh_token
  });

  console.log("Starting authorization flow...");
  console.log("");

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url!, `http://localhost:${REDIRECT_PORT}`);

        if (url.pathname === "/callback") {
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");

          if (error) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                  <h1>Authorization Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error(`Authorization failed: ${error}`));
            return;
          }

          if (!code) {
            res.writeHead(400, { "Content-Type": "text/html" });
            res.end(`
              <html>
                <body style="font-family: system-ui; padding: 40px; text-align: center;">
                  <h1>Authorization Failed</h1>
                  <p>No authorization code received.</p>
                  <p>You can close this window.</p>
                </body>
              </html>
            `);
            server.close();
            reject(new Error("No authorization code received"));
            return;
          }

          // Exchange code for tokens
          const { tokens } = await oauth2Client.getToken(code);

          // Save tokens
          await saveTokens({
            access_token: tokens.access_token!,
            refresh_token: tokens.refresh_token!,
            expiry_date: tokens.expiry_date!,
            token_type: tokens.token_type!,
            scope: tokens.scope!,
          });

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>Authorization Successful!</h1>
                <p>Tokens saved to: ${getTokenPath()}</p>
                <p>You can close this window and return to the terminal.</p>
              </body>
            </html>
          `);

          console.log("");
          console.log("Authorization successful!");
          console.log(`Tokens saved to: ${getTokenPath()}`);
          console.log("");
          console.log("You can now use the Google Calendar MCP server.");

          server.close();
          resolve();
        } else {
          res.writeHead(404);
          res.end("Not found");
        }
      } catch (err) {
        console.error("Error during authorization:", err);
        res.writeHead(500, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="font-family: system-ui; padding: 40px; text-align: center;">
              <h1>Authorization Error</h1>
              <p>${err instanceof Error ? err.message : "Unknown error"}</p>
              <p>You can close this window.</p>
            </body>
          </html>
        `);
        server.close();
        reject(err);
      }
    });

    server.listen(REDIRECT_PORT, () => {
      console.log(`Listening on port ${REDIRECT_PORT} for OAuth callback...`);
      console.log("");
      console.log("Opening browser for authorization...");
      console.log("If the browser doesn't open, visit this URL:");
      console.log("");
      console.log(authUrl);
      console.log("");

      open(authUrl).catch(() => {
        // If open fails, user can manually visit the URL
        console.log("Could not open browser automatically.");
        console.log("Please visit the URL above to authorize.");
      });
    });

    server.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "EADDRINUSE") {
        console.error(`Error: Port ${REDIRECT_PORT} is already in use.`);
        console.error("Please close any application using that port and try again.");
      } else {
        console.error("Server error:", err);
      }
      reject(err);
    });
  });
}

authorize()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Authorization failed:", error.message);
    process.exit(1);
  });
