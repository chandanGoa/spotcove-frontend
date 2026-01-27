# SpotCove Frontend

**Public-facing frontend deployment boundary**

This directory contains the **ONLY** code that should be deployed publicly for SpotCove's customer-facing website (spotcove.com).

## ⚠️ Critical Rules

1. **`frontend/` is the ONLY public deployable surface**
   - This code will be deployed to spotcove.com
   - Everything outside `frontend/` is considered "core" and is PRIVATE

2. **Core code is NEVER deployed publicly**
   - No database access from frontend
   - No admin features
   - No extraction/normalization/scoring logic
   - No server actions that touch core business logic

3. **Frontend consumes JSON + runtime only**
   - Uses `@spotcove/render-runtime` package for rendering
   - Loads demo data from static JSON files
   - No dependencies on core/ code

## What's Included

### Routes

- **`/demo/[keyword]`** - Public demo layouts
- **`/vendor/[vendorSlug]/[keyword]`** - Vendor storefronts
- **Subdomain routing** - Middleware rewrites subdomains

### Data Sources

- `src/data/demo-layouts/` - Layout JSON files
- `src/data/demo-themes/` - Theme JSON files
- `src/data/demo-products.json` - Demo product data
- `src/data/demo-collections.json` - Demo collection data
- `src/data/vendors.json` - Vendor fallback data

## Development

```bash
npm install
npm run dev    # Port 3001
npm run build
```

## Options Supported

✅ **Option 1**: Demo routes (`/demo/[keyword]`)
✅ **Option 2**: Vendor routes (`/vendor/[vendorSlug]/[keyword]`)
✅ **Option 3**: Subdomain routing (middleware)

## NOT Included (Intentionally)

❌ Database access
❌ Admin features
❌ Extraction/normalization pipelines
❌ Server actions
❌ Core business logic

---

**Status**: ✅ Ready for public deployment
