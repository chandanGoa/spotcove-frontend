# Publishing @spotcove/render-runtime to npm

## Prerequisites

Before you can publish this package to npm, you need to:

### 1. Create an npm Account (if you don't have one)
Visit https://www.npmjs.com/signup and create an account.

### 2. Log in to npm

```bash
npm login
```

You'll be prompted to enter:
- Username
- Password
- Email (this will be public)
- One-time password (if you have 2FA enabled)

### 3. Verify You're Logged In

```bash
npm whoami
```

This should display your npm username.

## Publishing the Package

### Option 1: Publish Directly (Recommended)

The package is configured with `publishConfig.access: "public"`, so you can simply run:

```bash
cd packages/render-runtime
npm publish
```

The `prepublishOnly` script will automatically:
1. Build the package
2. Create the dist/ folder
3. Publish only the necessary files

### Option 2: Manual Publish with Access Flag

If you prefer to be explicit:

```bash
cd packages/render-runtime
npm run build
npm publish --access public
```

## What Gets Published

The published package will include:
- ✅ `dist/index.js` (84KB CJS bundle)
- ✅ `dist/index.mjs` (77KB ESM bundle)
- ✅ `dist/index.d.ts` (TypeScript types)
- ✅ `dist/index.d.mts` (TypeScript types for ESM)
- ✅ `README.md`
- ✅ `RENDER_RUNTIME_CONTRACT.md`
- ✅ `package.json`

The following will NOT be published:
- ❌ `src/` directory (source files)
- ❌ `node_modules/`
- ❌ `tsconfig.json`
- ❌ `.gitignore`
- ❌ `IMPLEMENTATION_SUMMARY.md`

## Troubleshooting

### Error: "You must be logged in to publish packages"

**Solution**: Run `npm login` first.

### Error: "You do not have permission to publish @spotcove/render-runtime"

This means either:
1. The `@spotcove` organization doesn't exist on npm, OR
2. You don't have access to the `@spotcove` organization

**Solutions**:

**Option A: Create the @spotcove organization on npm**
1. Go to https://www.npmjs.com/org/create
2. Create an organization named `spotcove`
3. Add collaborators if needed
4. Retry publishing

**Option B: Publish under your own username**

Change the package name in `package.json`:
```json
{
  "name": "spotcove-render-runtime",
  // OR
  "name": "@yourusername/render-runtime"
}
```

Then publish:
```bash
npm publish --access public
```

### Error: "Package name already exists"

**Solution**: Change the package name or version in `package.json`.

## Updating the Package

After making changes:

1. Update the version in `package.json`:
   ```bash
   npm version patch  # 1.0.0 -> 1.0.1
   npm version minor  # 1.0.0 -> 1.1.0
   npm version major  # 1.0.0 -> 2.0.0
   ```

2. Publish:
   ```bash
   npm publish
   ```

## Verifying the Published Package

After publishing, verify it's available:

```bash
npm view @spotcove/render-runtime
```

Or install it in a test project:

```bash
npm install @spotcove/render-runtime
```

## Package Information

- **Package**: `@spotcove/render-runtime`
- **Version**: 1.0.0
- **Access**: Public
- **License**: MIT
- **Bundle Size**: 85KB (CJS), 78KB (ESM)
