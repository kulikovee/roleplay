import AutoBindMethods from './AutoBindMethods';

export default class Renderer extends AutoBindMethods {
    /**
     * @param {HTMLElement} container
     */
    constructor(container = null, params = {}) {
        super();

        this.fps = 60;
        this.targetFps = 70;
        this.lastRender = 0;
        this.backend = null;

        // Headless mode (authoritative game server): the scene is simulated, not drawn,
        // so we avoid creating a GL context entirely. A stub satisfies the few calls
        // Scene/Camera make on the renderer. This keeps the server free of native GL
        // dependencies (canvas/headless-gl) and of the WebGL2 requirement of modern three.
        if (params.headless) {
            this.renderer = {
                domElement: { width: 1, height: 1 },
                setSize: () => {},
                render: () => {},
                getContext: () => null,
            };
            this.backend = 'headless';
            this.isReady = true;
            this.ready = Promise.resolve();
            return;
        }

        // WebGPURenderer is only present in the browser bundle (three/webgpu). It drives
        // a WebGPU backend if the machine supports it and transparently falls back to a
        // WebGL2 backend otherwise.
        const useWebGPU = typeof THREE.WebGPURenderer === 'function';

        this.renderer = useWebGPU
            ? new THREE.WebGPURenderer({
                antialias: true,
                logarithmicDepthBuffer: true,
                alpha: true,
                powerPreference: 'high-performance',
                ...params,
            })
            : new THREE.WebGLRenderer({
                antialias: true,
                logarithmicDepthBuffer: true,
                alpha: true,
                powerPreference: 'high-performance',
                ...params,
            });

        if (container) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            // this.renderer.setClearColor(0xffffff, 0);
            // this.renderer.autoClear = false;
            this.renderer.outputColorSpace = THREE.SRGBColorSpace;
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowMap;

            container.appendChild(this.renderer.domElement);
        }

        if (useWebGPU) {
            // The WebGPU/WebGL2 backend initialises asynchronously; rendering is
            // skipped until it resolves.
            this.isReady = false;
            this.ready = this.renderer.init().then(() => {
                this.backend = this.renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL';
                this.isReady = true;
                console.info(`Renderer: using ${this.backend} backend`);
            });
        } else {
            this.backend = 'WebGL';
            this.isReady = true;
            this.ready = Promise.resolve();
        }
    }

    /**
     * @param {number|string} width
     * @param {number|string} height
     */
    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    /**
     * @param {THREE.Scene} scene
     * @param {THREE.Camera} camera
     */
    render(time, deltaTime, scene, camera) {
        if (!this.isReady) {
            return;
        }

        if (!this.lastRender) {
            this.lastRender = time - deltaTime;
        }

        const timeSinceLastRender = time - this.lastRender;
        const currentFPS = 1000 / timeSinceLastRender;
        this.fps -= (this.fps - currentFPS) / 60;
        this.targetFps = this.fps;

        if (timeSinceLastRender >= 1000 / this.targetFps || this.fps > 60) {
            this.renderer.render(scene, camera);
            this.lastRender = time;
        }

        this.targetFps += 10;
    }
}
