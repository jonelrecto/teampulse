# Fix for oxc-parser Native Binding Error

## Problem
The `@nuxt/eslint` module uses `oxc-parser` which requires native bindings that aren't installing correctly on Windows with pnpm.

## Solution Applied

1. **Removed `postinstall` script** - Changed to `prepare` script (runs only when needed, not during install)
2. **Added `.npmrc` and `.pnpmrc`** - Configured to handle optional dependencies properly
3. **Cleaned pnpm store** - Removed cached packages

## Steps to Fix

### Option 1: Reinstall (Recommended)

```bash
# Remove node_modules and lock file
rm -rf node_modules
rm pnpm-lock.yaml

# Reinstall with new configuration
pnpm install
```

### Option 2: If Option 1 Doesn't Work - Remove ESLint Module Temporarily

If you still get errors, you can temporarily remove `@nuxt/eslint`:

1. Edit `apps/web/package.json` and remove `"@nuxt/eslint": "^1.13.0"` from devDependencies
2. Run `pnpm install` again
3. You can add it back later once the project is running

### Option 3: Manual Native Binding Install

If needed, manually install the Windows native binding:

```bash
pnpm add -D @oxc-parser/binding-win32-x64-msvc --save-optional
```

## Verify Installation

After reinstalling, verify everything works:

```bash
# Check if Nuxt can prepare
cd apps/web
pnpm prepare

# Start dev server
pnpm dev
```

## Notes

- The `prepare` script will run automatically when you run `pnpm dev` or `pnpm build`
- ESLint is optional - the app will work without it
- You can add ESLint back later once dependencies are stable
