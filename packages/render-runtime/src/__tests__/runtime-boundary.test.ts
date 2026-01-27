/**
 * Runtime Boundary Tests
 * 
 * Ensures the render runtime maintains its contract:
 * - NO core-only module imports
 * - Public API remains stable
 * - Runtime can be imported successfully
 */

describe('Runtime Boundary Enforcement', () => {
  test('renderLayout can be imported', () => {
    // This will fail if there are any import errors or missing dependencies
    const { renderLayout } = require('../index');
    expect(renderLayout).toBeDefined();
    expect(typeof renderLayout).toBe('function');
  });

  test('Public API exports are available', () => {
    const exports = require('../index');
    
    // Core API
    expect(exports.renderLayout).toBeDefined();
    expect(exports.VendorLayoutRenderer).toBeDefined();
    expect(exports.VendorThemeProvider).toBeDefined();
    
    // Components
    expect(exports.HeroSection).toBeDefined();
    expect(exports.NewsletterSection).toBeDefined();
    expect(exports.Content).toBeDefined();
    expect(exports.ProductsSection).toBeDefined();
    expect(exports.CollectionsGrid).toBeDefined();
    expect(exports.FeaturedProducts).toBeDefined();
    expect(exports.SimpleNavbar).toBeDefined();
    expect(exports.MainFooter).toBeDefined();
    
    // Utilities
    expect(exports.cn).toBeDefined();
    expect(exports.getThemeOverrideStyles).toBeDefined();
    expect(exports.applyThemeToRoot).toBeDefined();
  });

  test('No forbidden imports from core modules', () => {
    const fs = require('fs');
    const path = require('path');
    
    // Files to check
    const filesToCheck = [
      '../VendorLayoutRenderer.tsx',
      '../VendorThemeContext.tsx',
      '../index.tsx',
      '../theme-wrapper.ts',
    ];
    
    // Forbidden import patterns
    const forbiddenPatterns = [
      /@\/lib\/supabase/,           // Supabase client
      /from ['"]@\/lib\/drizzle/,   // Drizzle ORM
      /from ['"]@\/lib\/auth/,      // Auth
      /from ['"]@\/lib\/cart/,      // Cart
      /from ['"]@\/features\//,     // Feature modules (except when refactored)
      /from ['"]@\/app\/api\//,     // API routes
      /from ['"]@\/middleware/,     // Middleware
      /from ['"]@\/\_actions/,      // Server actions
      /createClient\(/,             // Supabase createClient
      /useSupabase/,                // Supabase hooks
      /getServerSession/,           // Auth
      /next\/server/,               // Server components
    ];
    
    filesToCheck.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        forbiddenPatterns.forEach((pattern) => {
          if (pattern.test(content)) {
            throw new Error(
              `Forbidden import found in ${file}: ${pattern.toString()}\n` +
              `This violates the runtime boundary contract.`
            );
          }
        });
      }
    });
  });

  test('renderLayout accepts correct parameters', () => {
    const { renderLayout } = require('../index');
    
    // Should accept an options object
    const mockOptions = {
      target: document.createElement('div'),
      layout: { elements: [] },
      theme: { colors: {} },
      componentData: {},
      vendorSlug: 'test',
    };
    
    // This test just verifies the function signature
    // Actual rendering tested in __render_test__/
    expect(() => {
      // Type checking only - don't actually render
      const fn: (opts: typeof mockOptions) => any = renderLayout;
      expect(fn).toBeDefined();
    }).not.toThrow();
  });
});

describe('Runtime Dependencies', () => {
  test('Only allowed runtime dependencies are used', () => {
    const packageJson = require('../../package.json');
    const allowedDeps = [
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'lucide-react',
      '@radix-ui/react-slot',
    ];
    
    const runtimeDeps = Object.keys(packageJson.dependencies || {});
    
    runtimeDeps.forEach((dep) => {
      expect(allowedDeps).toContain(dep);
    });
  });

  test('React and ReactDOM are peer dependencies', () => {
    const packageJson = require('../../package.json');
    expect(packageJson.peerDependencies).toHaveProperty('react');
    expect(packageJson.peerDependencies).toHaveProperty('react-dom');
  });
});
