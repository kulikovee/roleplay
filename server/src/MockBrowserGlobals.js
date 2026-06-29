const log = console.log;
global.debug = (...params) => log(`[${(new Date()).toLocaleTimeString()}]`, ...params);
global.console.log = () => undefined;

const fs = require('fs');
const path = require('path');
const Mocks = require('mock-browser');

const { MockBrowser } = Mocks.mocks;
var mockBrowser = new MockBrowser();

global.document = MockBrowser.createDocument();
global.window = MockBrowser.createWindow();
// Blob is a Node.js global since v18, no polyfill needed.


let animationFrameFunctions = [];

setInterval(() => {
	const buffer = animationFrameFunctions;
	animationFrameFunctions = [];
	buffer.forEach(fn => fn());
}, 1000 / 60);

global.requestAnimationFrame = global.window.requestAnimationFrame = fn => animationFrameFunctions.push(fn);

global.window.location = {
	reload: () => debug('window.location.href'),
};

global.window.addEventListener = (...params) => debug('window.addEventListener', ...params);

global.WebSocket = global.window.WebSocket = function() {
	this.onopen = (...params) => debug('window.WebSocket.onopen', ...params);
	this.onerror = (...params) => debug('window.WebSocket.onerror', ...params);
	this.onmessage = (...params) => debug('window.WebSocket.onmessage', ...params);
};

// Keep Node's native URL constructor (three's fetch-based loaders build `new Request`
// from it); only add the object-URL helpers the code expects from a browser.
global.URL.createObjectURL = () => '';
global.URL.revokeObjectURL = () => {};
global.window.URL = global.URL;

// three r0.185's loaders fetch assets via the Fetch API instead of XMLHttpRequest.
// Back fetch() with the local filesystem: the two real environment models are served
// from disk, everything else (effects, units, external textures) falls back to a tiny
// dummy model since the headless server never renders.
const REAL_MODELS = [
	'./assets/models/environment/static-objects.glb',
	'./assets/models/environment/island.glb',
];

const resolveAssetPath = (url) => {
	const rel = String(url).split(/[?#]/)[0];
	const model = REAL_MODELS.includes(rel) ? rel : './assets/models/dummy.glb';
	return path.resolve(path.join(__dirname, '../../client/src/', model));
};

// Lenient Request shim so relative URLs (e.g. './assets/...') don't fail URL parsing.
global.Request = global.window.Request = function Request(url, init = {}) {
	this.url = typeof url === 'string' ? url : (url && url.url) || '';
	this.headers = init.headers || null;
};

// GLTFLoader reads textures via `self` and decodes them with createImageBitmap. The
// headless server never renders, so resolve every image to a 1x1 stub bitmap. This
// keeps texture promises from hanging (which would stall the whole glTF parse).
global.self = global;
global.createImageBitmap = async () => ({ width: 1, height: 1, close() {} });

// three reports download progress with ProgressEvent, which Node doesn't define.
global.ProgressEvent = global.window.ProgressEvent || class ProgressEvent {
	constructor(type, init = {}) {
		this.type = type;
		Object.assign(this, init);
	}
};

global.fetch = global.window.fetch = async (input) => {
	const url = typeof input === 'string' ? input : (input && input.url) || '';
	const buffer = fs.readFileSync(resolveAssetPath(url));
	return new Response(buffer, {
		status: 200,
		headers: { 'Content-Length': String(buffer.length) },
	});
};

// Load three.js and its GLTFLoader addon from the same ES module instance, so
// that `instanceof THREE.*` checks against the global THREE keep working for
// models loaded through GLTFLoader (the addon is ESM-only). `threeReady`
// resolves once the globals are set; the scene must not be initialised before.
exports.threeReady = (async () => {
	global.THREE = await import('three');
	const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
	global.GLTFLoader = GLTFLoader;
})();

exports.MockGUI = {
		setRestartButtonVisible: () => null,
		setPause: () => null,
		restartGame: () => null,
		isPause: () => false,
		isThirdPerson: () => false,
		update: () => null,
		setConnectionRole: debug,
		updatePlayerParams: () => null,
		clearHpBars: () => null,
		switchCamera: () => null,
		setFps: () => null,
		setPing: () => null,
		notify: debug,
		setLoading: () => null,
		onSuccessLogin: () => null,
};
