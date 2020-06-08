import { Player } from './GameObjects';
// import Audio from './Audio';
import AutoBindMethods from './AutoBindMethods';
import Camera from './Camera';
import Connection from './Connection';
import GameObjectsService from './GameObjects';
import Input from './Input';
import Intervals from './Intervals';
import Location from './Locations/DreamTown';
import Colliders from './Colliders';
import Models from './Models';
import Particles from './Particles';
import PathFinder from './PathFinder';
import Units from './Units';


export default class Scene extends AutoBindMethods {
    /**
     * @param {Renderer} renderer
     * @param {{
     *  setRestartButtonVisible: function,
     *  setPause: function,
     *  restartGame: function,
     *  isPause: function,
     *  isThirdPerson: function,
     *  update: function,
     *  updatePlayerParams: function,
     *  clearHpBars: function,
     *  switchCamera: function,
     *  setFps: function,
     *  notify: function,
     * }} ui
     */
    constructor(renderer, ui) {
        super();
        this.clock = new THREE.Clock();
        this.intervals = new Intervals(this);
        this.renderer = renderer;
        this.ui = ui;
        this.models = new Models(this);
        this.scene = new THREE.Scene();
        this.pathFinder = new PathFinder(this);
        this.colliders = new Colliders(this);
        this.units = new Units(this);
        this.camera = new Camera(this);
        // this.audio = new Audio(this);
        this.input = new Input({
            onAction: () => this.level.onAction(),
            onExit: () => this.ui.setPause(!this.ui.isPause()),
            onZoom: zoom => this.camera.addY(zoom),
            onSwitchCamera: () => this.ui.switchCamera(),
        });
        this.gameObjectsService = new GameObjectsService(this);
        this.particles = new Particles(this);

        const connectionHostname = window.location.hostname === 'localhost' ? 'localhost' : 'gohtml.ru';
        const isSSL = window.location.hostname !== 'localhost';
        this.connection = new Connection(this, connectionHostname, 1337, isSSL);
        this.location = new Location(this);

        this.intervals.setInterval(() => {
            this.ui.setFps(this.renderer.fps, this.renderer.targetFps);
            this.ui.updatePlayerParams()
        }, 1000);

        this.input.isThirdPerson = ui.isThirdPerson();
        this.pathFinder.rebuildAreas();

        this.clearScene();
        this.animate();

        // console.log('Scene', this);
    }

    clearScene() {
        this.gameObjectsService.removeAll();
        this.location.afterClear();
    }

    animate() {
        const now = Date.now();
        const deltaTime = this.intervals.getDeltaTime(now);
        this.intervals.update(now);
        const gameTime = this.intervals.getTimePassed();

        this.gameObjectsService.update(gameTime, deltaTime);

        if (!this.ui.isPause()) {
            this.camera.update(gameTime, deltaTime);
            this.input.update();
        }

        this.ui.update();
        this.location.update();
        this.particles.update();
        this.connection.update(gameTime, deltaTime);

        this.renderer.render(this.scene, this.camera.camera, deltaTime);
        window.requestAnimationFrame(this.animate);
    }

    setLoggedUser(userName, password) {
        this.user = { userName, password };
    }

    /**
     * @returns {Player}
     */
    getPlayer() {
        return this.units.getPlayer();
    }

    /**
     * @param {THREE.Object3D} object
     */
    add(object) {
        this.scene.add(object);
    }

    /**
     * @param {THREE.Object3D} object
     */
    remove(object) {
        this.scene.remove(object);
    }

    notify(text) {
        this.ui.notify(text);
    }
}
