import * as THREE from 'three';
import Audio from './Audio';
import AutoBindMethods from './AutoBindMethods';
import Camera from './Camera';
import Connection from './Connection';
import GameObjectsService from './GameObjects';
import Input from './Input';
import Intervals from './Intervals';
import LevelMap from './Levels/LevelMap';
import Colliders from './Colliders';
import Models from './Models';
import Particles from './Particles';
import UI from './UI';
import Units from './Units';


export default class Scene extends AutoBindMethods {
    /**
     * @param {Renderer} renderer
     */
    constructor(renderer, ui) {
        super();
        this.intervals = new Intervals(this);
        this.renderer = renderer;
        this.ui = ui;
        this.models = new Models(this);
        this.scene = new THREE.Scene();
        this.colliders = new Colliders(this);
        this.units = new Units(this);
        this.camera = new Camera(this);
        this.audio = new Audio(this);
        this.input = new Input({
            onAction: () => this.level.onAction(),
            onExit: () => this.ui.setPause(!this.ui.isPause()),
            onZoom: zoom => this.camera.addY(zoom),
            onSwitchCamera: () => this.ui.switchCamera(),
        });
        this.gameObjectsService = new GameObjectsService(this);
        // this.ui = new UI(this);
        this.particles = new Particles(this);
        this.connection = new Connection(this, 'gohtml.ru');
        this.level = new LevelMap(this);

        this.input.isThirdPerson = ui.isThirdPerson();

        this.clearScene();
        this.animate();

        console.log('Scene', this);
    }

    clearScene() {
        this.gameObjectsService.removeAll();
        this.units.createPlayer({
            onCreate: (player) => {
                this.camera.player = player;
                this.ui.updatePlayerParams();
            },
            onDie: () => window.setTimeout(() => {
                this.ui.setRestartButtonVisible(true);
                this.ui.setPause(true);
            }, 2500),
            onKill: (object) => {
                const player = this.getPlayer();
                player.params.experience += object.params.bounty;
                player.params.money += object.params.bounty;
            },
            onDamageTaken: () => this.ui.updatePlayerParams(),
            onLevelUp: () => this.ui.updatePlayerParams(),
        });
    }

    animate() {
        this.intervals.update();

        if (!this.ui.isPause()) {
            this.gameObjectsService.update();
            this.camera.update();
            this.ui.update();
            this.input.update();
            this.level.update();
            this.particles.update();
            this.connection.send(this.getPlayer());
        }

        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(this.animate);
    }

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
}
