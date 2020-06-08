import { Vector3 } from 'three/src/math/Vector3';
import { Quaternion } from 'three/src/math/Quaternion';

global.debug = (...params) => console.log(`[${(new Date).toLocaleTimeString()}]`, ...params);

const Object3D = (params = {}) => {
	let objects = [];
	const add = object => objects.push(object);
	const remove = object => objects = object.filter(o => o !== object);

	const object = ({
		position: new Vector3(),
		scale: new Vector3(),
		rotation: new Quaternion(),
		add,
		remove,
		lookAt: () => ({}),
		traverse: () => ({}),
		updateMatrix: () => ({}),
		getObjectByName: () => object,
		...params,
	});

	object.quaternion = object.rotation;
	object.scene = object;
	object.clone = () => {
		const cloned = Object3D();
		cloned.position.clone(object.position);
		cloned.scale.clone(object.scale);
		cloned.rotation.clone(object.rotation);
		return cloned;
	};

	return object;
};

global.THREE = {
	Vector3,
	Quaternion,
	Object3D,
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
	Scene: () => Object3D(),
	Cache: {},
	Clock: () => ({}),
	AnimationMixer: () => ({
		update: () => ({}),
		clipAction: () => ({
			stop: () => ({}),
		}),
	}),
	PCFSoftShadowMap: () => ({}),
	PerspectiveCamera: () => Object3D(),
	Raycaster: () => ({}),
	TextureLoader: () => ({
		load: () => ({}),
	}),
	Fog: () => ({}),
	RepeatWrapping: () => ({}),
	Color: () => ({}),
	Mesh: () => Object3D(),
	CubeGeometry: () => ({}),
	MeshLambertMaterial: () => ({}),
	NormalBlending: () => ({}),
	AdditiveBlending: () => ({}),
	Geometry: () => ({}),
	PointCloudMaterial: () => ({}),
	PointCloud: () => ({}),
	AmbientLight: () => ({}),
	DirectionalLight: () => {
		const light = Object3D();
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
	load: (url, callback) => callback(Object3D()),
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
		notify: debug,
		setLoading: () => null,
};

export const MockRenderer = {
	fps: 1,
		targetFps: 1,
		renderer: new THREE.WebGLRenderer(),
		render: () => ({}),
};
