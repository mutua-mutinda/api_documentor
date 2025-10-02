# Development Guide

This document outlines the development setup, scripts, and debugging options for the API Documentor project.

## Prerequisites

- Node.js 18+
- npm or yarn
- Access to a Strapi backend instance

## Environment Setup

Create a `.env.local` file with the following variables:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token
STRAPI_WEBHOOK_SECRET=your_webhook_secret (coming soon)
```

## Development Scripts

### Standard Development

```bash
# Start development server with Turbopack
npm run dev

# Clean cache and start fresh
npm run dev:clean
```

### Debugging Scripts

#### Basic Debugging
```bash
# Start with Node.js debugger attached
npm run dev:debug
# Connect to: chrome://inspect or use VS Code debugger
```

#### Advanced Debugging
```bash
# Start with breakpoint before execution
npm run dev:debug-brk
# Useful for debugging initialization issues

# Start with performance profiling
npm run dev:profile
# Generates v8.log file for performance analysis

# Start with increased memory and debugging
npm run dev:heap
# For memory leak debugging and heap snapshots
```

#### Build Debugging
```bash
# Build with debugging enabled
npm run build:debug

# Production server with debugging
npm run start:debug
```

#### Trace and Analysis
```bash
# Enable trace warnings for better error tracking
npm run turbo:trace

# Build with bundle analysis
npm run build:analyze
```

### Code Quality

```bash
# Check code formatting and linting
npm run lint

# Format code
npm run format
```

### Maintenance

```bash
# Clean build artifacts and cache
npm run clean
```

## Debugging in VS Code

Add this configuration to your `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev", "--turbopack"],
      "env": {
        "NODE_OPTIONS": "--inspect"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Next.js (break on start)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev", "--turbopack"],
      "env": {
        "NODE_OPTIONS": "--inspect-brk"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## Chrome DevTools Debugging

1. Run `npm run dev:debug`
2. Open Chrome and navigate to `chrome://inspect`
3. Click "Open dedicated DevTools for Node"
4. Set breakpoints in your code

## Performance Profiling

### CPU Profiling
```bash
npm run dev:profile
# Run your application
# Stop the server (Ctrl+C)
# Analyze the generated v8.log file
```

### Memory Debugging
```bash
npm run dev:heap
# Take heap snapshots in Chrome DevTools
# Compare memory usage over time
```

## Turbopack Features

This project uses Turbopack for faster builds:

- **Fast Refresh**: Instant updates on code changes
- **Optimized Bundling**: Better tree shaking and code splitting
- **Memory Efficient**: Lower memory usage compared to webpack
- **Better Error Messages**: More descriptive error reporting

## Common Issues & Solutions

### Port Already in Use
The development server will automatically find an available port (3001, 3002, etc.)

### Memory Issues
Use the `dev:heap` script with increased memory allocation:
```bash
npm run dev:heap
```

### Browser Extension Conflicts
The project includes error suppression for common browser extension issues. If problems persist:
1. Try incognito mode
2. Disable React DevTools temporarily
3. Clear browser cache and site data

### API Connection Issues
1. Verify `.env.local` configuration
2. Check Strapi backend is running
3. Verify API token permissions
4. Check network connectivity

## Project Structure

```
api_documentor/
├── app/                    # Next.js App Router
├── components/            # Reusable React components
├── lib/                   # Utility functions and API calls
├── types/                 # TypeScript type definitions
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── turbo.json           # Turbopack configuration
└── tsconfig.json        # TypeScript configuration
```

## API Integration

The project integrates with Strapi v4 using simplified types:

### Simplified Type System
Instead of complex nested Strapi entities, we use flattened types:

```typescript
// Before (complex nested structure)
StrapiEntity<Article> = {
  id: number,
  attributes: {
    title: string,
    author: { data: { attributes: { name: string } } }
  }
}

// After (simplified flat structure)
Article = {
  id: number,
  title: string,
  author: { id: number, name: string }
}
```

### Key Features
- **Flat data structure** - Direct property access without nested attributes
- **Automatic transformation** - Strapi responses are transformed automatically
- **Type safety** - Full TypeScript support with simplified interfaces
- **Type guards** - Helper functions for dynamic content blocks
- **Image optimization** - Built-in CDN support for media files
- **Webhook revalidation** - Cache invalidation on content updates

### Dynamic Content Blocks
The system supports dynamic content blocks with type guards:

```typescript
import { isRichTextBlock, isMediaBlock } from '@/types/strapi';

if (isRichTextBlock(block)) {
  // TypeScript knows this is RichTextBlock
  return <div dangerouslySetInnerHTML={{ __html: block.body }} />;
}
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start
```

For deployment to Vercel, Netlify, or similar platforms, ensure environment variables are configured in your deployment settings.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run format`
4. Test thoroughly with `npm run dev:debug`
5. Submit a pull request

## Troubleshooting

### Turbopack Issues
If you encounter Turbopack-specific issues, you can temporarily fall back to webpack:
```bash
# Remove --turbopack flag
next dev
```

### Cache Issues
```bash
npm run clean
npm run dev
```

### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

For more help, check the [Next.js documentation](https://nextjs.org/docs) or [Turbopack documentation](https://turbo.build/pack/docs).
