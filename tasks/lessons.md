# Lessons Learned

<!-- Updated after every correction. Prevents repeat mistakes. -->

## Module System
- Use CommonJS (no "type": "module") for all Node.js packages to avoid .js extension requirements and drizzle-orm ESM compatibility issues
- Web package uses ESM (Vite handles it)

## Drizzle ORM
- Pass `schema` object to drizzle() to enable db.query.* relational API
- Define relations in schema.ts to enable `with:` in queries
- Use drizzle-kit generate → migrate workflow; never hand-edit SQL

## MCP SDK
- MCP tools must use StdioServerTransport for editor integration
- Zod schemas provide both validation AND documentation for MCP tool inputs

## React Components
- Keep each component under 120 lines; extract sub-components when over
- Use inline styles for dynamic prop-driven colors; Tailwind for layout
- All sample data shape comes from decidr-code-board.jsx reference
