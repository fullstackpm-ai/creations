import { readFile, writeFile, mkdir } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

const TOKEN_DIR = join(homedir(), ".google-calendar-mcp");
const TOKEN_PATH = join(TOKEN_DIR, "tokens.json");

export interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type: string;
  scope: string;
}

export async function loadTokens(): Promise<StoredTokens | null> {
  try {
    const data = await readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: Partial<StoredTokens>): Promise<void> {
  await mkdir(TOKEN_DIR, { recursive: true });

  // Merge with existing tokens to preserve refresh_token if not provided
  const existing = await loadTokens();
  const merged = {
    ...existing,
    ...tokens,
  };

  await writeFile(TOKEN_PATH, JSON.stringify(merged, null, 2));
}

export function getTokenPath(): string {
  return TOKEN_PATH;
}
