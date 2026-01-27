# @spotcove/render-runtime - Contract Documentation

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** January 14, 2026

## Overview

`@spotcove/render-runtime` is a minimal, standalone package that renders SpotCove layout JSON + theme JSON **WITHOUT** access to the core application. It contains ONLY the presentation logic needed to display layouts.

## What's Included

### Core Files
- `VendorLayoutRenderer.tsx` - Main layout rendering engine (copied unchanged from core)
- `VendorThemeContext.tsx` - Theme context provider (stripped of API calls)
- `theme-wrapper.ts` - Theme application utilities (pure functions only)
- `renderer-validation.ts` - Layout validation (copied unchanged)
- `utils.ts` - Utility functions (`cn` only)
- `index.ts` - Public API

### Components Included

#### Tier 1: Presentation-Only Components (No Data Fetching)
- ✅ `HeroSection.tsx` - Hero banner with title/subtitle/CTA
- ✅ `NewsletterSection.tsx` - Newsletter signup form
- ✅ `Content.tsx` - Flexible content sections
- ✅ `SimpleNavbar.tsx` - **NEW** Static navigation bar
- ✅ `MainFooter.tsx` - Static footer

#### Tier 2: Refactored Components (Data via Props)
- ✅ `ProductsSection.tsx` - **REFACTORED** - Accepts products via props
- ✅ `CollectionsGrid.tsx` - **REFACTORED** - Accepts collections via props
- ✅ `FeaturedProducts.tsx` - **REFACTORED** - Accepts products via props

#### UI Components (shadcn subset)
- ✅ `Button` - Button component
- ✅ `Card`, `CardContent`, `CardFooter` - Card components
- ✅ `Badge` - Badge component
- ✅ `Input` - Input component

### Refactoring Summary

All Tier 2 components were refactored to:
- **REMOVE** `useEffect` hooks
- **REMOVE** Supabase client creation
- **REMOVE** all data fetching logic
- **ACCEPT** data via props:
  - `ProductsSection`: accepts `products: ProductData[]`
  - `CollectionsGrid`: accepts `collections: CollectionData[]`
  - `FeaturedProducts`: accepts `products: FeaturedProductData[]`
- **PRESERVE** all presentation logic (layouts, styling, theme support)

## What's Excluded

### Feature-Coupled Components (Tier 3)
- ❌ `MainNavbar` - Requires auth, cart, user session
- ❌ `CartWidget` - Requires cart state
- ❌ `UserMenu` - Requires auth state
- ❌ Any component with data fetching logic

### Core-Only Dependencies (Tier 4)
- ❌ Database access (Supabase, Drizzle)
- ❌ API routes
- ❌ Server components
- ❌ Middleware
- ❌ Admin components
- ❌ Environment validation
- ❌ Authentication logic
- ❌ Cart logic
- ❌ Next.js specific utilities

## Public API

### Main Function: `renderLayout()`

```typescript
import { renderLayout } from '@spotcove/render-runtime';

const root = renderLayout({
  // Target DOM element
  target: document.getElementById('app'),
  
  // Layout JSON structure
  layout: {
    elements: [
      {
        id: 'hero-1',
        type: 'container',
        components: [
          {
            id: 'hero-component',
            type: 'hero',
            settings: {
              title: 'Welcome',
              subtitle: 'Discover amazing products',
              buttonText: 'Shop Now'
            }
          }
        ]
      }
    ]
  },
  
  // Theme settings
  theme: {
    colors: {
      primary: '#3b82f6',
      background: '#ffffff',
      foreground: '#000000'
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif'
    }
  },
  
  // Component data (for refactored components)
  componentData: {
    'products-section-1': {
      products: [
        {
          id: '1',
          name: 'Product 1',
          price: 29.99,
          slug: 'product-1',
          image: { src: '/img.jpg', alt: 'Product' }
        }
      ]
    },
    'collections-grid-1': {
      collections: [
        {
          id: '1',
          label: 'Electronics',
          slug: 'electronics',
          image: { src: '/cat.jpg', alt: 'Electronics' }
        }
      ]
    }
  },
  
  // Optional vendor slug for debugging
  vendorSlug: 'my-store',
  
  // Optional children for default layout
  children: <div>Custom content</div>
});

// Later: unmount
root.unmount();
```

### Component Data Format

#### ProductsSection & FeaturedProducts
```typescript
{
  products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number | string;
    slug: string;
    rating?: number;
    badge?: string;
    image?: {
      src: string;
      alt: string;
    };
  }>
}
```

#### CollectionsGrid
```typescript
{
  collections: Array<{
    id: string;
    label: string;
    slug: string;
    image?: {
      src: string;
      alt: string;
    };
  }>
}
```

### Theme & Font Behavior

The runtime applies themes **identically** to the core application:

1. **CSS Variables**: Theme colors are converted to CSS custom properties
2. **HSL Conversion**: Hex colors are auto-converted to HSL format
3. **Font Loading**: Font families are applied via `--font-*` variables
4. **Spacing Tokens**: Standard spacing tokens are injected
5. **Theme Override**: Component-level theme overrides work the same

## Data Expectations

### Per Component

| Component | Data Required | Format |
|-----------|--------------|--------|
| `HeroSection` | None | Settings only |
| `NewsletterSection` | None | Settings only |
| `Content` | None | Settings only |
| `SimpleNavbar` | None | Settings only |
| `MainFooter` | None | Settings only |
| `ProductsSection` | Yes | `products: ProductData[]` |
| `CollectionsGrid` | Yes | `collections: CollectionData[]` |
| `FeaturedProducts` | Yes | `products: FeaturedProductData[]` |

### Passing Data

Data is passed via the `componentData` parameter:

```typescript
componentData: {
  // Component ID from layout JSON
  'products-section-1': {
    // Data specific to this component
    products: [...]
  }
}
```

## Explicit Non-Goals

This package **DOES NOT**:

1. ❌ Create or manage databases
2. ❌ Provide authentication
3. ❌ Manage shopping carts
4. ❌ Fetch data from APIs
5. ❌ Sync layout JSON to/from storage
6. ❌ Generate layout JSON
7. ❌ Provide a visual layout editor
8. ❌ Handle routing
9. ❌ Provide server-side rendering
10. ❌ Include deployment configs

## Use Cases

### ✅ Correct Usage
- Rendering layouts in a standalone React app
- Preview system for layout builders
- Embedding layouts in third-party apps
- Testing layout rendering without core
- Sandboxed theme preview

### ❌ Incorrect Usage
- Replacing the entire SpotCove core
- Building a SaaS product
- Creating a layout builder (this is render-only)
- Exporting layouts to other formats
- Managing layout persistence

## Dependencies

### Runtime Dependencies
- `react` (peer)
- `react-dom` (peer)
- `clsx` - Class name utility
- `tailwind-merge` - Tailwind class merging
- `class-variance-authority` - Component variants
- `lucide-react` - Icons

### Zero Dependencies On
- ❌ Next.js
- ❌ Supabase
- ❌ Database drivers
- ❌ Auth libraries
- ❌ State management (beyond React context)

## Layout JSON Contract

The runtime accepts the same layout JSON format as core:

### Zones Format (Legacy)
```json
{
  "zones": [
    {
      "id": "main",
      "components": [
        {
          "id": "hero-1",
          "type": "hero",
          "settings": { ... },
          "themeOverride": { ... }
        }
      ]
    }
  ]
}
```

### Elements Format (New)
```json
{
  "elements": [
    {
      "id": "container-1",
      "type": "container",
      "settings": { ... },
      "components": [ ... ],
      "children": [ ... ]
    }
  ]
}
```

## Build Output

```
dist/
├── index.js          # CommonJS bundle
├── index.mjs         # ES Module bundle
├── index.d.ts        # TypeScript types
└── index.d.ts.map    # Type source maps
```

## Version Compatibility

- React: ^18
- TypeScript: ^5.0
- Node: >=16

## Migration Guide

If you're migrating from core to runtime:

1. **Remove data fetching**: Move all data fetching outside the runtime
2. **Pass data via props**: Use `componentData` parameter
3. **Handle events**: Use `onProductClick`, `onCollectionClick` callbacks
4. **Manage routing**: Handle navigation externally
5. **Theme loading**: Pass theme JSON directly (no API calls)

## Support

For issues or questions:
- GitHub Issues: [chandanGoa/SpotCove-Ecommerce](https://github.com/chandanGoa/SpotCove-Ecommerce)
- Documentation: See `README.md` in package root

## License

MIT
