# Troubleshooting Guide

This guide helps you resolve common issues when developing or using Boostlly.

## Table of Contents

- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [Testing Issues](#testing-issues)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)

## Build Issues

### TypeScript Compilation Errors

**Problem**: Type errors when building packages.

**Solutions**:
1. Run `pnpm type-check` to see all type errors
2. Check that all dependencies are installed: `pnpm install`
3. Clear TypeScript build info: `pnpm --recursive run clean`
4. Rebuild from scratch: `pnpm build`

### Module Resolution Errors

**Problem**: Cannot find module '@boostlly/...'

**Solutions**:
1. Ensure you're using pnpm: `pnpm install`
2. Check that workspace packages are built: `pnpm build`
3. Verify `pnpm-workspace.yaml` includes all packages
4. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Build Failures

**Problem**: Build fails with unclear error messages.

**Solutions**:
1. Check the specific package that failed
2. Review recent changes to that package
3. Check for circular dependencies
4. Verify all peer dependencies are installed

## Runtime Errors

### Storage Not Working

**Problem**: Data not persisting or storage errors.

**Solutions**:
1. **Web**: Check browser console for localStorage errors
   - Ensure cookies/localStorage are enabled
   - Check for quota exceeded errors
2. **Extension**: Verify chrome.storage permissions in manifest
3. **Android**: Check AsyncStorage permissions

### Quote Loading Fails

**Problem**: Quotes don't load or show error messages.

**Solutions**:
1. Check network connectivity
2. Verify API endpoints are accessible
3. Check browser console for CORS errors
4. Review quote provider health status
5. Check rate limiting - may need to wait

### Theme Not Applying

**Problem**: Theme changes don't take effect.

**Solutions**:
1. Clear browser cache and reload
2. Check CSS variables are being set correctly
3. Verify theme preference in storage
4. Check for CSS conflicts

## Testing Issues

### Tests Failing Locally

**Problem**: Tests pass in CI but fail locally.

**Solutions**:
1. Clear test cache: `pnpm test --clearCache`
2. Ensure all dependencies are installed
3. Check Node.js version matches CI
4. Run tests in isolation: `pnpm test --run`

### Component Tests Not Rendering

**Problem**: React components don't render in tests.

**Solutions**:
1. Verify test setup file is configured
2. Check that React Testing Library is imported
3. Ensure jsdom environment is set in vitest.config
4. Check for missing mocks

### E2E Tests Timeout

**Problem**: Playwright tests timeout.

**Solutions**:
1. Increase timeout in playwright.config.ts
2. Check that dev server is running
3. Verify baseURL is correct
4. Check for flaky selectors - use more stable selectors

## Platform-Specific Issues

### Web App Issues

**Problem**: PWA not working or offline mode fails.

**Solutions**:
1. Check service worker registration
2. Verify manifest.json is valid
3. Check HTTPS requirement for service workers
4. Clear service worker cache

### Extension Issues

**Problem**: Extension not loading or permissions denied.

**Solutions**:
1. Check manifest.json for correct permissions
2. Verify extension is loaded in developer mode
3. Check for content security policy violations
4. Review background script errors

### Android App Issues

**Problem**: App crashes or doesn't build.

**Solutions**:
1. Check React Native version compatibility
2. Verify Android SDK is installed
3. Check Metro bundler is running
4. Review native module compatibility

## Performance Issues

### Slow Initial Load

**Problem**: App takes long to load initially.

**Solutions**:
1. Check bundle size with `pnpm build --analyze`
2. Verify code splitting is working
3. Check for large dependencies
4. Review lazy loading implementation

### Memory Leaks

**Problem**: App memory usage grows over time.

**Solutions**:
1. Check for event listeners not being cleaned up
2. Verify useEffect cleanup functions
3. Check for circular references
4. Use React DevTools Profiler

## Common Error Messages

### "Cannot find module '@boostlly/core'"

**Solution**: Run `pnpm install` and ensure workspace packages are built.

### "Type 'any' is not allowed"

**Solution**: Replace `any` with proper types. See [Type Safety Guide](../adr/005-type-safety-approach.md).

### "Storage quota exceeded"

**Solution**: Clear old data or implement data cleanup.

### "CORS error"

**Solution**: Check API endpoint configuration and CORS headers.

### "Provider failed: Rate limit exceeded"

**Solution**: Wait before retrying or use a different provider.

## Getting Help

If you're still experiencing issues:

1. Check the [GitHub Issues](https://github.com/your-repo/issues)
2. Review recent changes in git history
3. Check logs in browser console or terminal
4. Create a minimal reproduction case

## Debugging Tips

### Enable Debug Logging

```typescript
// In development
localStorage.setItem('debug', 'true');
```

### Use React DevTools

Install React DevTools browser extension for component inspection.

### Use Network Tab

Check browser Network tab for failed API requests.

### Check Storage

```javascript
// In browser console
localStorage.getItem('quotes');
chrome.storage.local.get(null, console.log); // Extension
```

## Prevention

To avoid common issues:

1. **Run type checks**: `pnpm type-check` before committing
2. **Run tests**: `pnpm test` before pushing
3. **Verify builds**: `pnpm build` before deploying
4. **Review changes**: Check git diff before committing
5. **Update dependencies**: Keep dependencies up to date

