import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Models, textures and audio are referenced at runtime by string URLs
// (e.g. `./assets/models/...glb`), so they are copied verbatim into the
// build output / served in dev rather than being processed by the bundler.
export default defineConfig({
    base: './',
    server: {
        port: 9000,
    },
    build: {
        // Keep hashed JS/CSS in `build/` so they don't intermingle with the
        // copied game assets under `assets/`.
        assetsDir: 'build',
    },
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                { src: 'src/assets/**/*', dest: '.', rename: { stripBase: 1 } },
                { src: 'src/favicon.ico', dest: '.', rename: { stripBase: 1 } },
            ],
        }),
    ],
});
