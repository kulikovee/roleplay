const esbuild = require('esbuild');

// Bundles the shared client scene/game code (which is authored as ES modules)
// into a single CommonJS file that server.js can require. Native and other
// node_modules packages (three, canvas, gl, ws, ...) are kept external and
// resolved at runtime.
esbuild
    .build({
        entryPoints: ['src/Scene.js'],
        outfile: 'dist/server-scene.js',
        bundle: true,
        platform: 'node',
        format: 'cjs',
        target: 'node20',
        packages: 'external',
        sourcemap: 'inline',
        logLevel: 'info',
    })
    .catch(() => process.exit(1));
