# Frozen Runtime Files

**Status**: LOCKED  
**Date Frozen**: January 15, 2026  
**Reason**: Successfully rendered real data in `__render_test__/`

## Overview

The following files are **FROZEN** and must NOT be modified without updating the render runtime contract (RENDER_RUNTIME_CONTRACT.md).

Any modifications to these files require:
1. Updating the contract documentation
2. Verifying `__render_test__/` still renders correctly
3. Running the runtime boundary tests
4. Obtaining approval for contract change

---

## Frozen Files

### Core Runtime Files

#### 1. `src/index.tsx`
**Status**: ⚠️ FROZEN PUBLIC API  
**Function**: Main public API (`renderLayout()`)  
**Verified**: ✅ Successfully rendered hero + products + newsletter in test app  
**Contract**: Must maintain backward compatibility for `renderLayout()` signature

**Current Signature**:
```typescript
function renderLayout(options: RenderLayoutOptions): ReactDOM.Root
```

**DO NOT**:
- Change `renderLayout()` parameter structure
- Add required parameters (only optional ones allowed)
- Remove or rename exported functions
- Add core dependencies

---

#### 2. `src/VendorLayoutRenderer.tsx`
**Status**: ⚠️ FROZEN  
**Function**: Main layout rendering engine  
**Verified**: ✅ Rendered hero, products grid, newsletter sections  
**Contract**: See RENDER_RUNTIME_CONTRACT.md

**DO NOT**:
- Import from `@/lib/supabase`
- Import from `@/lib/drizzle`
- Import from `@/lib/auth`
- Import from `@/features/*` (except refactored components)
- Import from `@/app/api/*`
- Import from `@/middleware`
- Import from `@/_actions/*`
- Add `useEffect` hooks for data fetching
- Call `createClient()` or `useSupabase()`

**ALLOWED**:
- Read layout JSON via props
- Read componentData via props
- Render components from local `./components/`
- Apply theme overrides
- Use local utilities

---

#### 3. `src/VendorThemeContext.tsx`
**Status**: ⚠️ FROZEN  
**Function**: Theme context provider (prop-based only)  
**Verified**: ✅ Successfully applied CSS variables, HSL colors, fonts  
**Contract**: See RENDER_RUNTIME_CONTRACT.md

**DO NOT**:
- Add API calls (`fetch`, `axios`, Supabase)
- Add data fetching hooks
- Import from core modules
- Add database queries

**ALLOWED**:
- Accept `themeSettings` via props
- Accept `layout` via props
- Apply CSS variables to DOM
- Provide context to children

---

#### 4. `src/theme-wrapper.ts`
**Status**: ⚠️ FROZEN  
**Function**: Pure theme application functions  
**Verified**: ✅ Applied primary blue (#4169E1), background/foreground colors, fonts  
**Contract**: Must preserve HSL color format and CSS variable injection

**DO NOT**:
- Add external API calls
- Add side effects beyond DOM style updates
- Change HSL color parsing
- Change CSS variable naming scheme

**ALLOWED**:
- Pure functions for theme transformation
- DOM style updates (`element.style.setProperty`)
- Color format conversions (hex → HSL)

---

### Tier 1 Dependencies (Required for Rendering)

These files are part of the runtime boundary but can be modified if needed (with caution):

#### 5. `src/renderer-validation.ts`
**Status**: FROZEN (copied unchanged from core)  
**Function**: Layout validation utilities  
**Modifications**: Only if validation logic needs updates

#### 6. `src/utils.ts`
**Status**: FROZEN (minimal - cn only)  
**Function**: Utility functions (`cn` for className merging)  
**Modifications**: Only to add pure utility functions

---

### Component Files

#### Tier 1 Components (Presentation Only)
**Status**: FROZEN (working as expected)

- `src/components/HeroSection.tsx` ✅
- `src/components/NewsletterSection.tsx` ✅
- `src/components/Content.tsx` ✅
- `src/components/SimpleNavbar.tsx` ✅
- `src/components/MainFooter.tsx` ✅

**Rules for all Tier 1 components**:
- NO `useEffect` for data fetching
- NO Supabase imports
- NO database access
- Accept all data via props

---

#### Tier 2 Components (Refactored)
**Status**: ⚠️ FROZEN - CRITICAL REFACTORING  
**Reason**: These were refactored to remove core dependencies

- `src/components/ProductsSection.tsx` ✅ Removed ~60 LOC data fetching
- `src/components/CollectionsGrid.tsx` ✅ Removed ~40 LOC data fetching
- `src/components/FeaturedProducts.tsx` ✅ Removed ~50 LOC data fetching

**CRITICAL RULES**:
- MUST accept data via props (`products: ProductData[]`, `collections: CollectionData[]`)
- NO `useEffect(async () => { fetch... }, [])` patterns
- NO `createClient()` calls
- NO database queries
- NO API route calls

**Verified Working**:
- ProductsSection rendered 3 products with prices, ratings, badges
- CollectionsGrid structure prepared
- FeaturedProducts structure prepared

---

#### UI Components (shadcn subset)
**Status**: FROZEN (minimal necessary set)

- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/input.tsx`

**Modifications**: Only to fix styling or accessibility issues

---

## Runtime Boundary Contract

### What's FORBIDDEN in ALL frozen files:

```typescript
// ❌ NEVER ALLOWED
import { createClient } from '@/lib/supabase/client';
import { db } from '@/lib/drizzle';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/features/cart';
import { getProducts } from '@/_actions/products';
import { NextRequest } from 'next/server';

// ❌ NEVER DO THIS
useEffect(() => {
  const supabase = createClient();
  supabase.from('products').select('*').then(setProducts);
}, []);
```

### What's ALLOWED:

```typescript
// ✅ ALLOWED
import { cn } from './utils';
import { Button } from './components/ui/button';
import { getThemeOverrideStyles } from './theme-wrapper';

// ✅ ALLOWED
function ProductsSection({ products, onProductClick }: Props) {
  return products.map(product => (
    <ProductCard key={product.id} onClick={() => onProductClick?.(product)} />
  ));
}
```

---

## Testing the Boundary

Run the boundary enforcement tests:

```bash
cd packages/render-runtime
npm test src/__tests__/runtime-boundary.test.ts
```

These tests verify:
- ✅ `renderLayout()` can be imported without errors
- ✅ All public API exports are available
- ✅ No forbidden imports from core modules
- ✅ Only allowed dependencies are used
- ✅ React/ReactDOM are peer dependencies

---

## Verification Checklist

Before unfreezing any file:

- [ ] Read RENDER_RUNTIME_CONTRACT.md
- [ ] Understand why the file was frozen
- [ ] Propose changes in separate design doc
- [ ] Get approval for contract change
- [ ] Update contract documentation
- [ ] Rebuild package: `npm run build`
- [ ] Test in `__render_test__/`: `npm run dev`
- [ ] Verify rendering still works
- [ ] Run boundary tests: `npm test`
- [ ] Update this FROZEN.md file
- [ ] Document breaking changes

---

## Successfully Rendered Test Data

The frozen runtime successfully rendered:

✅ **Hero Section**
- Title: "Render Runtime Test"
- Subtitle with theme colors
- CTA button with primary blue (#4169E1)

✅ **Products Section**
- 3 products grid
- Product names, descriptions
- Prices: $29.99, $49.99, $19.99
- Star ratings: 4.5⭐, 5⭐, 4⭐
- Badges: "New", "Sale"
- Primary blue "View Product" buttons

✅ **Newsletter Section**
- Title: "Stay Updated"
- Email input field
- Subscribe button (primary blue)

✅ **Theme Application**
- CSS variables: `--primary: 220 70% 50%`
- Background: `--background: 0 0% 100%`
- Fonts: `--font-body: system-ui, -apple-system, sans-serif`
- Complete shadcn/ui color palette

---

## Contact

For questions about frozen files or contract changes, see:
- RENDER_RUNTIME_CONTRACT.md (full contract specification)
- __render_test__/TEST_RESULTS.md (verification results)
- IMPLEMENTATION_SUMMARY.md (implementation details)
