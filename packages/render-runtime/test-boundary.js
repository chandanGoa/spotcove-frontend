#!/usr/bin/env node

/**
 * Runtime Boundary Enforcement Script
 * 
 * Verifies that the render runtime maintains its contract:
 * - NO core-only module imports
 * - Public API remains stable
 * - Runtime can be imported successfully
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Runtime Boundary Enforcement Test\n');

// Test 1: Import test
console.log('Test 1: Verifying runtime can be imported...');
try {
  const runtime = require('./dist/index.js');
  
  if (!runtime.renderLayout) {
    throw new Error('renderLayout not exported');
  }
  
  console.log('  ✅ Runtime imported successfully');
  console.log('  ✅ renderLayout() is available');
} catch (e) {
  console.error('  ❌ Import failed:', e.message);
  process.exit(1);
}

// Test 2: Public API exports
console.log('\nTest 2: Verifying public API exports...');
try {
  const runtime = require('./dist/index.js');
  
  const requiredExports = [
    'renderLayout',
    'VendorLayoutRenderer',
    'VendorThemeProvider',
    'HeroSection',
    'NewsletterSection',
    'Content',
    'ProductsSection',
    'CollectionsGrid',
    'FeaturedProducts',
    'SimpleNavbar',
    'MainFooter',
    'cn',
    'getThemeOverrideStyles',
    'applyThemeToRoot',
  ];
  
  const missing = requiredExports.filter(name => !runtime[name]);
  
  if (missing.length > 0) {
    throw new Error(`Missing exports: ${missing.join(', ')}`);
  }
  
  console.log(`  ✅ All ${requiredExports.length} required exports present`);
} catch (e) {
  console.error('  ❌ API test failed:', e.message);
  process.exit(1);
}

// Test 3: No forbidden imports
console.log('\nTest 3: Checking for forbidden imports...');
try {
  const filesToCheck = [
    'src/VendorLayoutRenderer.tsx',
    'src/VendorThemeContext.tsx',
    'src/index.tsx',
    'src/theme-wrapper.ts',
  ];
  
  const forbiddenPatterns = [
    { pattern: /@\/lib\/supabase/, name: 'Supabase client' },
    { pattern: /from ['"]@\/lib\/drizzle/, name: 'Drizzle ORM' },
    { pattern: /from ['"]@\/lib\/auth/, name: 'Auth' },
    { pattern: /from ['"]@\/lib\/cart/, name: 'Cart' },
    { pattern: /from ['"]@\/app\/api\//, name: 'API routes' },
    { pattern: /from ['"]@\/middleware/, name: 'Middleware' },
    { pattern: /from ['"]@\/_actions/, name: 'Server actions' },
    { pattern: /createClient\(/, name: 'Supabase createClient()' },
    { pattern: /useSupabase/, name: 'Supabase hooks' },
    { pattern: /getServerSession/, name: 'Auth session' },
    { pattern: /next\/server/, name: 'Server components' },
  ];
  
  let violations = 0;
  
  filesToCheck.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      forbiddenPatterns.forEach(({ pattern, name }) => {
        if (pattern.test(content)) {
          console.error(`  ❌ Forbidden import in ${file}: ${name}`);
          violations++;
        }
      });
    }
  });
  
  if (violations > 0) {
    throw new Error(`Found ${violations} forbidden import(s)`);
  }
  
  console.log('  ✅ No forbidden imports detected');
} catch (e) {
  console.error('  ❌ Boundary check failed:', e.message);
  process.exit(1);
}

// Test 4: Dependencies check
console.log('\nTest 4: Verifying dependencies...');
try {
  const packageJson = require('./package.json');
  
  const allowedDeps = [
    'clsx',
    'tailwind-merge',
    'class-variance-authority',
    'lucide-react',
    '@radix-ui/react-slot',
  ];
  
  const runtimeDeps = Object.keys(packageJson.dependencies || {});
  const forbidden = runtimeDeps.filter(dep => !allowedDeps.includes(dep));
  
  if (forbidden.length > 0) {
    throw new Error(`Forbidden dependencies: ${forbidden.join(', ')}`);
  }
  
  if (!packageJson.peerDependencies?.react) {
    throw new Error('React not listed as peer dependency');
  }
  
  if (!packageJson.peerDependencies?.['react-dom']) {
    throw new Error('ReactDOM not listed as peer dependency');
  }
  
  console.log(`  ✅ ${runtimeDeps.length} runtime dependencies (all allowed)`);
  console.log('  ✅ React & ReactDOM are peer dependencies');
} catch (e) {
  console.error('  ❌ Dependency check failed:', e.message);
  process.exit(1);
}

// Success
console.log('\n✅ All runtime boundary tests passed!');
console.log('\nThe render runtime is FROZEN and maintains its contract:');
console.log('  • No core dependencies');
console.log('  • No database access');
console.log('  • No API calls');
console.log('  • Public API stable');
console.log('\nSee FROZEN.md for modification rules.');
