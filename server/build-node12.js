const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

// Build a single CommonJS bundle that runs on Node 12.8.
//
// The normal build (build.js) keeps three/ws external and relies on the host
// Node supporting ESM + require(ESM) + global fetch. Node 12 has none of that,
// so here we bundle EVERYTHING (server.js, the shared scene/client code, three
// and its GLTFLoader addon, ws, mock-browser) into one file and let esbuild
// downlevel the syntax (??, optional chaining, class static blocks, ESM) to a
// Node 12 target. Runtime globals that Node 12 lacks (Response/Blob) are added
// by the banner shim. Build with a modern Node; the OUTPUT runs on Node 12.

const banner = fs.readFileSync(path.join(__dirname, 'src/node12-globals.js'), 'utf8');

// server.js does `require('./dist/server-scene')` (the output of build.js). For
// this bundle we instead pull the scene from its ESM source so it gets bundled
// and transpiled in the same pass. Same `initScene` export either way.
const sceneFromSource = {
	name: 'scene-from-source',
	setup(build) {
		build.onResolve({ filter: /(^|\/)dist\/server-scene$/ }, () => ({
			path: path.join(__dirname, 'src/Scene.js'),
		}));
	},
};

esbuild
	.build({
		absWorkingDir: __dirname,
		entryPoints: ['server.js'],
		outfile: 'dist/server.node12.cjs',
		bundle: true,
		platform: 'node',
		format: 'cjs',
		target: 'node12',
		// ws, mock-browser and its jsdom dep are plain CommonJS that already run
		// on Node >=10, and jsdom resolves a worker file at load time that can't
		// be bundled (./xhr-sync-worker.js) — so keep them external and let them
		// load from node_modules at runtime. Only the ESM / modern-syntax code
		// (three, the GLTFLoader addon, the scene/client graph) gets bundled and
		// downleveled. bufferutil/utf-8-validate are ws's optional, uninstalled
		// native speedups.
		external: ['ws', 'mock-browser', 'bufferutil', 'utf-8-validate'],
		banner: { js: banner },
		sourcemap: 'inline',
		logLevel: 'info',
		plugins: [sceneFromSource],
	})
	.catch(() => process.exit(1));
