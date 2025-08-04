# Neynar MCP Integration Guide

## Overview

This project now includes the Neynar MCP (Model Context Protocol) integration, which provides AI assistants with access to the latest Neynar documentation and API references. This integration helps maintain Farcaster docs and official standards as first-class citizens while leveraging Neynar's comprehensive API ecosystem.

## MCP Integration Status

✅ **Successfully Installed**: The Neynar MCP server has been installed and configured in Cursor
✅ **API Test Passed**: Your API key is working correctly (36 characters, connectivity confirmed)
✅ **Search Functionality**: MCP can search across Neynar documentation for relevant context

## Key Benefits

1. **Real-time Documentation Access**: AI assistants can search Neynar docs for the latest API changes
2. **Farcaster Standards Compliance**: Maintains official Farcaster documentation as primary reference
3. **Enhanced Development Experience**: Get contextual help while coding Farcaster mini-apps
4. **API Best Practices**: Access to Neynar's recommended patterns and examples

## Current Project Integration

### Backend (Node.js/Express)
- **Location**: `server.js`
- **API Key**: Configured via `NEYNAR_API_KEY` environment variable
- **Endpoints**: User data, followers, following, casts, and more
- **Authentication**: Uses Neynar API key for authenticated requests

### Frontend (Next.js)
- **Location**: `frontend/` directory
- **Dependencies**: `@farcaster/miniapp-sdk` for Farcaster integration
- **UI Components**: Modern React components with Tailwind CSS

## Using the MCP in Development

### For AI Assistants
The MCP provides a `search` function that can query Neynar documentation:

```typescript
// Example MCP search queries
"user authentication and API key setup"
"fetch user followers and following"
"publish casts and reactions"
"mini-app authentication flow"
"channel-specific notifications"
```

### For Developers
1. **API Documentation**: Use MCP to search for specific API endpoints
2. **Best Practices**: Get recommendations for Farcaster mini-app development
3. **Error Resolution**: Search for common issues and solutions
4. **Feature Discovery**: Explore new Neynar API capabilities

## Farcaster Standards Priority

While Neynar provides excellent tooling, this project maintains:

1. **Official Farcaster Docs**: Primary reference for protocol standards
2. **Farcaster Mini-App SDK**: Official SDK for mini-app development
3. **Protocol Compliance**: Follows Farcaster's official specifications
4. **Community Standards**: Adheres to Farcaster community best practices

## API Test Results

Your current setup is working correctly:

```json
{
  "success": true,
  "message": "API connectivity test passed",
  "apiKeyAvailable": true,
  "apiKeyLength": 36,
  "testResult": {
    "status": 200,
    "usersFound": 1
  }
}
```

## Environment Configuration

### Required Environment Variables

```bash
# Backend (.env)
NEYNAR_API_KEY=your_36_character_api_key
NEYNAR_CLIENT_ID=your_client_id
CORS_ORIGIN=http://localhost:3000

# Frontend (frontend/.env)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

## Development Workflow

1. **Start Backend**: `npm run dev` (runs on port 4000)
2. **Start Frontend**: `cd frontend && npm run dev` (runs on port 3000)
3. **Use MCP**: AI assistants can now search Neynar docs for help
4. **Test API**: Use `node test-api.js` to verify connectivity

## MCP Server Details

- **Location**: `/Users/alecgutman/.mcp/neynar`
- **Command**: `node /Users/alecgutman/.mcp/neynar/src/index.js`
- **Configuration**: Automatically added to Cursor config
- **Functionality**: Search across Neynar documentation

## Best Practices

1. **Always reference official Farcaster docs first**
2. **Use Neynar MCP for implementation details and examples**
3. **Follow Farcaster mini-app standards**
4. **Test API connectivity regularly**
5. **Keep API keys secure and rotate when needed**

## Troubleshooting

### MCP Issues
- Restart Cursor if MCP search isn't working
- Check MCP server is running: `node /Users/alecgutman/.mcp/neynar/src/index.js`

### API Issues
- Verify API key is 36 characters long
- Check network connectivity
- Review rate limits and quotas

### Development Issues
- Ensure both backend and frontend are running
- Check CORS configuration
- Verify environment variables are set

## Next Steps

1. **Explore Neynar API Features**: Use MCP to discover new capabilities
2. **Enhance Mini-App**: Add more Farcaster-specific features
3. **Improve Documentation**: Keep this guide updated with new findings
4. **Community Integration**: Follow Farcaster community standards

## Resources

- **Official Farcaster Docs**: https://docs.farcaster.xyz/
- **Neynar API Docs**: https://docs.neynar.com/
- **Farcaster Mini-App SDK**: https://github.com/farcasterxyz/miniapp-sdk
- **This Project**: QuickTop8 Farcaster Mini-App

---

*This guide emphasizes Farcaster standards while leveraging Neynar's excellent tooling and documentation through MCP integration.* 