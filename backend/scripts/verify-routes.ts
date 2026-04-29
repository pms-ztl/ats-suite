import 'dotenv/config';
import app from './app';

// Express 5 uses a different internal structure
// Let's extract routes by walking the router stack
function getRoutes(expressApp: any): Array<{method: string, path: string}> {
  const routes: Array<{method: string, path: string}> = [];

  function walk(stack: any, basePath: string) {
    if (!stack) return;
    for (const layer of stack) {
      if (layer.route) {
        // This is a route
        const routePath = basePath + (layer.route.path || '');
        for (const method of Object.keys(layer.route.methods)) {
          if (layer.route.methods[method]) {
            routes.push({ method: method.toUpperCase(), path: routePath });
          }
        }
      } else if (layer.handle && layer.handle.stack) {
        // This is a sub-router
        let prefix = '';
        if (layer.path && layer.path !== '/') {
          prefix = layer.path;
        } else if (layer.regexp) {
          // Try to extract path from regexp
          const src = layer.regexp.source || String(layer.regexp);
          if (src && src !== '(?:)' && src !== '^\\/?$' && !src.startsWith('^\\/?(?=')) {
            prefix = src.replace(/\\\//g, '/').replace(/\^/g, '').replace(/\$/g, '').replace(/\\?\?\(\?=.*\)/, '');
          }
        }
        walk(layer.handle.stack, basePath + prefix);
      }
    }
  }

  // Try multiple access patterns for Express 5
  const router = expressApp._router || expressApp.router;
  if (router && router.stack) {
    walk(router.stack, '');
  }

  // Also try the Express 5 way via app.router
  if (routes.length === 0 && expressApp._router) {
    console.log('Router stack layers: ' + (expressApp._router.stack || []).length);
    for (const layer of (expressApp._router.stack || [])) {
      console.log('  Layer: name=' + layer.name + ' path=' + (layer.path || 'N/A') + ' hasRoute=' + !!layer.route + ' hasStack=' + !!(layer.handle && layer.handle.stack));
    }
  }

  return routes;
}

const routes = getRoutes(app);
const apiRoutes = routes.filter(r => r.path.includes('/api') || r.path.startsWith('/'));

console.log('Total routes found: ' + routes.length);
console.log('API routes: ' + apiRoutes.length);

if (routes.length === 0) {
  // Alternative: count from source files directly
  console.log('\nExpress 5 internal structure may differ. Falling back to static analysis...');

  const fs = require('fs');
  const path = require('path');

  let totalEndpoints = 0;
  const enginesDir = path.join(__dirname, 'engines');
  for (const engine of fs.readdirSync(enginesDir)) {
    const routePath = path.join(enginesDir, engine, 'routes.ts');
    if (!fs.existsSync(routePath)) continue;
    const content = fs.readFileSync(routePath, 'utf-8');
    const matches = content.match(/router\.(get|post|put|delete|patch)\(/g) || [];
    totalEndpoints += matches.length;
    console.log('  ' + engine + ': ' + matches.length + ' endpoints');
  }
  console.log('\nTotal endpoints in source: ' + totalEndpoints);

  if (totalEndpoints >= 374) {
    console.log('PASS: All ' + totalEndpoints + ' endpoints present in source code');
  } else {
    console.log('FAIL: Only ' + totalEndpoints + ' endpoints (expected 374+)');
  }
}
