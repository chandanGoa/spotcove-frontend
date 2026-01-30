# @spotcove/render-runtime

⚠️ **FROZEN RUNTIME** - Successfully verified rendering real data. See [FROZEN.md](./FROZEN.md) for modification rules.

A minimal, standalone layout and theme renderer for SpotCove. Renders layout.json + theme.json **without access to core**.

## Status

- **Version**: 1.0.0
- **Status**: ✅ Production Ready - FROZEN
- **Last Verified**: January 15, 2026 in `__render_test__/`
- **Contract**: See [RENDER_RUNTIME_CONTRACT.md](./RENDER_RUNTIME_CONTRACT.md)
- **Frozen Files**: See [FROZEN.md](./FROZEN.md)

## Features

- ✅ **Standalone**: No database, no API, no core dependencies
- ✅ **Lightweight**: Only rendering logic, no feature coupling
- ✅ **React-based**: Works in any React 18+ environment
- ✅ **Type-safe**: Full TypeScript support
- ✅ **Theme-aware**: Identical theme behavior to core
- ✅ **Data-driven**: Accept component data via props
- ✅ **Verified**: Successfully rendered hero + products + newsletter

## Installation

```bash
npm install @spotcove/render-runtime react react-dom
```

**Note**: If the package hasn't been published to npm yet, see [PUBLISHING.md](./PUBLISHING.md) for publishing instructions.

## Quick Start

```typescript
import { renderLayout } from '@spotcove/render-runtime';

// Prepare your data
const layoutJSON = {
  elements: [
    {
      id: 'hero',
      type: 'container',
      components: [
        {
          id: 'hero-1',
          type: 'hero',
          settings: {
            title: 'Welcome to Our Store',
            subtitle: 'Discover amazing products',
            buttonText: 'Shop Now'
          }
        }
      ]
    }
  ]
};

const themeSettings = {
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    foreground: '#000000'
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif'
  }
};

// Render
const root = renderLayout({
  target: document.getElementById('app'),
  layout: layoutJSON,
  theme: themeSettings
});
```

## Rendering Components with Data

For components that need data (products, collections), pass it via `componentData`:

```typescript
renderLayout({
  target: document.getElementById('app'),
  layout: layoutJSON,
  theme: themeSettings,
  componentData: {
    // Component ID from layout JSON
    'products-section-1': {
      products: [
        {
          id: '1',
          name: 'Amazing Product',
          price: 29.99,
          slug: 'amazing-product',
          image: {
            src: '/images/product.jpg',
            alt: 'Amazing Product'
          }
        }
      ],
      // Optional: handle product clicks
      onProductClick: (product) => {
        window.location.href = `/products/${product.slug}`;
      }
    },
    'collections-grid-1': {
      collections: [
        {
          id: '1',
          label: 'Electronics',
          slug: 'electronics',
          image: {
            src: '/images/electronics.jpg',
            alt: 'Electronics'
          }
        }
      ],
      onCollectionClick: (collection) => {
        window.location.href = `/collections/${collection.slug}`;
      }
    }
  }
});
```

## Available Components

### Presentation-Only (No Data Required)
- `HeroSection` - Hero banner
- `NewsletterSection` - Newsletter form
- `Content` - Flexible content sections
- `SimpleNavbar` - Static navigation
- `MainFooter` - Static footer

### Data-Driven (Require Props)
- `ProductsSection` - Product grid/carousel
- `CollectionsGrid` - Collection tiles
- `FeaturedProducts` - Featured product grid

## Component Data Types

```typescript
// For ProductsSection & FeaturedProducts
interface ProductData {
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
}

// For CollectionsGrid
interface CollectionData {
  id: string;
  label: string;
  slug: string;
  image?: {
    src: string;
    alt: string;
  };
}
```

## Advanced Usage

### Using Components Directly

```typescript
import { ProductsSection } from '@spotcove/render-runtime';

function MyApp() {
  const products = [
    /* ... your products ... */
  ];

  return (
    <ProductsSection
      settings={{
        title: 'Our Products',
        columns: 4,
        showRating: true
      }}
      products={products}
      onProductClick={(product) => {
        console.log('Clicked:', product);
      }}
    />
  );
}
```

### Custom Theme Provider

```typescript
import { VendorThemeProvider, VendorLayoutRenderer } from '@spotcove/render-runtime';

function MyApp() {
  return (
    <VendorThemeProvider
      themeSettings={myTheme}
      layout={myLayout}
      vendorSlug="my-store"
    >
      <VendorLayoutRenderer componentData={myData} />
    </VendorThemeProvider>
  );
}
```

## Theme Behavior

Themes are applied **identically** to the core SpotCove application:

1. Colors are converted to CSS custom properties
2. Hex colors are auto-converted to HSL
3. Fonts are applied via CSS variables
4. Component-level theme overrides work the same

## Layout JSON Format

Supports both formats:

### Elements Format (Recommended)
```json
{
  "elements": [
    {
      "id": "section-1",
      "type": "container",
      "settings": {
        "className": "max-w-7xl mx-auto"
      },
      "components": [
        {
          "id": "hero-1",
          "type": "hero",
          "settings": { ... }
        }
      ],
      "children": [ ... ]
    }
  ]
}
```

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
          "settings": { ... }
        }
      ]
    }
  ]
}
```

## What's NOT Included

This package does **NOT** provide:

- ❌ Database access
- ❌ API routes or data fetching
- ❌ Authentication
- ❌ Shopping cart
- ❌ Layout builder/editor
- ❌ Layout persistence/sync
- ❌ Server-side rendering
- ❌ Routing

## Requirements

- React ^18
- TypeScript ^5 (optional but recommended)
- Node.js >=16

## Full Documentation

- **[FROZEN.md](./FROZEN.md)** - List of frozen files and modification rules ⚠️
- **[RENDER_RUNTIME_CONTRACT.md](./RENDER_RUNTIME_CONTRACT.md)** - Complete contract specification
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[PUBLISHING.md](./PUBLISHING.md)** - npm publishing guide

### Contract Documentation

See [RENDER_RUNTIME_CONTRACT.md](./RENDER_RUNTIME_CONTRACT.md) for:
- Complete API reference
- Data expectations per component
- Migration guide
- Version compatibility
- Explicit non-goals

### Modifying the Runtime

⚠️ **Before making ANY changes to this package**, read [FROZEN.md](./FROZEN.md).

The runtime is FROZEN because it successfully rendered real data in `__render_test__/`. Changes require:
1. Reading the contract documentation
2. Verifying changes don't break test app rendering
3. Running boundary enforcement tests
4. Updating documentation

## License

MIT

## Support

- GitHub: [chandanGoa/SpotCove-Ecommerce](https://github.com/chandanGoa/SpotCove-Ecommerce)
- Issues: [GitHub Issues](https://github.com/chandanGoa/SpotCove-Ecommerce/issues)
