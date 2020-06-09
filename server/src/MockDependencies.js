import { Vector3 } from 'three/src/math/Vector3';
import { Quaternion } from 'three/src/math/Quaternion';
import { Object3D } from 'three/src/core/Object3D';

global.debug = (...params) => console.log(`[${(new Date).toLocaleTimeString()}]`, ...params);

class Obj3D extends Object3D {
	constructor(...props) {
		super(...props);
		this.scene = this;
	}
}

global.THREE = {
	Vector3,
	Quaternion,
	Object3D: Obj3D,
	WebGLRenderer: () => ({
		render: () => ({}),
		setSize: () => ({}),
		getContext: () => ({
			canvas: {
				width: 0,
				height: 0
			},
		}),
		shadowMap: {},
	}),
	Scene: Obj3D,
	Cache: {},
	Clock: () => ({}),
	AnimationMixer: () => ({
		update: () => ({}),
		clipAction: () => ({
			stop: () => ({}),
		}),
	}),
	PCFSoftShadowMap: () => ({}),
	PerspectiveCamera: Obj3D,
	Raycaster: () => ({}),
	TextureLoader: () => ({
		load: () => ({}),
	}),
	Fog: () => ({}),
	RepeatWrapping: () => ({}),
	Color: () => ({}),
	Mesh: Obj3D,
	CubeGeometry: () => ({}),
	MeshLambertMaterial: () => ({}),
	NormalBlending: () => ({}),
	AdditiveBlending: () => ({}),
	Geometry: () => ({}),
	PointCloudMaterial: () => ({}),
	PointCloud: () => ({}),
	AmbientLight: () => ({}),
	DirectionalLight: () => {
		const light = new Obj3D();
		light.shadow = {
			camera: {},
			mapSize: {},
		};
		return light;
	},
	MeshBasicMaterial: () => ({}),
	BackSide: () => ({}),
	MeshFaceMaterial: () => ({}),
};

global.GLTFLoader = () => ({
	load: (url, callback) => callback(new Obj3D()),
});

global.window = {
	innerWidth: 0,
	innerHeight: 0,
	clearTimeout: 0,
	requestAnimationFrame: fn => setTimeout(fn, 1000 / 60),
	location: {
		reload: () => debug('reload page'),
	},
	addEventListener: (...params) => debug('window.addEventListener', ...params),
	setTimeout: setTimeout,
	WebSocket: () => ({
		onopen: (...params) => debug('window.WebSocket.onopen', ...params),
		onerror: (...params) => debug('window.WebSocket.onerror', ...params),
		onmessage: (...params) => debug('window.WebSocket.onmessage', ...params),
	}),
};

global.document = {
	body: {
		addEventListener: (...params) => debug('document.body.addEventListener', ...params),
		removeEventListener: (...params) => debug('document.body.removeEventListener', ...params),
	},
	dispatchEvent: (...params) => debug('document.dispatchEvent', ...params),
	getElementById: (...params) => debug('document.getElementById', ...params),
	addEventListener: (...params) => debug('document.addEventListener', ...params),
	removeEventListener: (...params) => debug('document.removeEventListener', ...params),
};

export const MockGUI = {
		isServer: true,
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
};

export const MockRenderer = {
	fps: 1,
		targetFps: 1,
		renderer: new THREE.WebGLRenderer(),
		render: () => ({}),
};
