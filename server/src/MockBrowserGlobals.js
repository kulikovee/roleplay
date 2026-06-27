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

global.URL = global.window.URL = {
	createObjectURL: () => '',
	revokeObjectURL: () => '',
};

global.XMLHttpRequest = function() {
	this.onload = [];
	this.resolved = false;
	this.status = 200;
	this.mimeType = 'model/gltf-binary';
	this.responseType = 'arraybuffer';

	function toArrayBuffer(buf) {
		var ab = new ArrayBuffer(buf.length);
		var view = new Uint8Array(ab);
		for (var i = 0; i < buf.length; ++i) {
			view[i] = buf[i];
		}
		return ab;
	}

	const addOnLoad = (fn) => {
		this.onload.push({ sent: false, fn });

		if (this.resolved) {
			this.send();
		}
	};

	this.addEventListener = (name, fn) => {
		if (name === 'load') {
			addOnLoad(fn);
		}
	};

	this.onreadystatechange = addOnLoad;

	this.getResponse = () => ({
		status: this.status,
		response: this.response,
		mimeType: this.mimeType,
		// responseText: this.responseText,
		responseType: this.responseType,
	});

	this.open = (method, url) => {
		if (url !== './assets/models/environment/static-objects.glb' && url !== './assets/models/environment/island.glb') {
			url = './assets/models/dummy.glb';
		}

		const filePath = path.resolve(path.join(__dirname , '../../client/src/', url));
		this.response = toArrayBuffer(fs.readFileSync(filePath));
	};

	this.send = () => {
		this.resolved = true;
		this.onload.filter(({ sent }) => !sent).forEach(onLoad => {
			onLoad.sent = true;
			onLoad.fn.call(this, this.getResponse());
		});
	};
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
