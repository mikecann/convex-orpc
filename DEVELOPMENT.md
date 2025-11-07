# Development Guide

This is a monorepo containing an npm package and an example Convex application.

## Project Structure

```
fluent-convex/
├── src/                    # NPM package source code
│   ├── builder.ts         # Main builder class
│   ├── middleware.ts      # Middleware types
│   ├── types.ts          # Type definitions
│   ├── zod_support.ts    # Zod integration
│   ├── index.ts          # Package exports
│   └── builder.test-d.ts # Type tests
├── example/               # Example Convex application
│   ├── convex/           # Convex backend
│   ├── src/              # React frontend
│   └── package.json      # References parent package
├── dist/                  # Built package (gitignored)
├── package.json          # Package metadata & scripts
├── tsconfig.build.json   # TypeScript config for building
├── tsconfig.json         # TypeScript config for development
└── vitest.config.ts      # Test configuration
```

## Development Workflow

### Building the Package

```bash
npm run build
```

This compiles TypeScript files from `/src` to `/dist`.

### Running Tests

```bash
npm test              # Run tests once
npm run dev:test      # Run tests in watch mode
```

### Type Checking

```bash
npm run typecheck
```

### Working on the Example

The example uses the local package via `"fluent-convex": "file:.."` in its `package.json`.

```bash
cd example
npm install           # Install dependencies (links to parent)
npm run dev           # Start Convex dev + frontend
```

**Important:** When you modify the package code in `/src`, you need to rebuild it for changes to take effect in the example:

```bash
# In the root directory
npm run build

# Or run in watch mode
npm run dev
```

## Publishing

Before publishing to npm:

1. Update the version in `package.json`
2. Run `npm run build` to ensure everything compiles
3. Run `npm test` to ensure all tests pass
4. Update the README if needed
5. Run `npm publish`

## Making Changes

1. **Edit package code** - Make changes in `/src`
2. **Build** - Run `npm run build` to compile
3. **Test** - Run `npm test` to verify types
4. **Try it** - Test in the example app

## Tips

- Use `npm run dev` in the root to rebuild the package automatically on file changes
- The example will need to restart its Convex dev server to pick up package changes
