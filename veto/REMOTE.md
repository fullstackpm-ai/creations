# Veto Remote MCP Server

A minimal remote MCP server for mobile access to Veto's capture functionality.

## Features

- `veto_capture` - Capture ideas and actions from anywhere
- `veto_get_today_state` - Check today's state assessment
- Simple bearer token authentication
- Designed for Claude Mobile app access

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VETO_API_TOKEN` | Yes | Bearer token for authentication |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `PORT` | No | Server port (default: 3000) |

## Local Development

```bash
# Set environment variables
export VETO_API_TOKEN="your-secret-token"
export SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run in development mode
npm run dev:remote

# Or build and run
npm run build
npm run start:remote
```

## Deploy to Railway

1. Create a new Railway project
2. Connect your GitHub repo
3. Set environment variables in Railway dashboard:
   - `VETO_API_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy - Railway will use `railway.json` config automatically

## Connect to Claude Mobile

1. Go to [claude.ai/settings](https://claude.ai/settings)
2. Navigate to **MCP Servers** section
3. Add a new remote server:
   - **URL**: `https://your-railway-app.railway.app/mcp`
   - **Authentication**: Bearer token
   - **Token**: Your `VETO_API_TOKEN` value

4. The server will now be available in Claude iOS/Android apps

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/mcp` | POST | Yes | MCP protocol endpoint |

## Testing

```bash
# Health check
curl https://your-server/health

# Test MCP (requires proper MCP client)
curl -X POST https://your-server/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

## Security Notes

- Use a strong, random token for `VETO_API_TOKEN`
- The Supabase service role key has full database access - keep it secret
- For personal use only; not designed for multi-tenant access
