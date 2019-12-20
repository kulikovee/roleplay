import * as THREE from 'three';
import Audio from './Audio';
import AutoBindMethods from './AutoBindMethods';
import Camera from './Camera';
import Connection from './Connection';
import GameObjectsService from './GameObjects';
import Input from './Input';
import Intervals from './Intervals';
import Level from './Levels/DreamCity';
import Colliders from './Colliders';
import Models from './Models';
import Particles from './Particles';
import PathFinder from './PathFinder';
import Units from './Units';


export default class Scene extends AutoBindMethods {
    /**
     * @param {Renderer} renderer
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
        this.audio = new Audio(this);
        this.input = new Input({
            onAction: () => this.level.onAction(),
            onExit: () => this.ui.setPause(!this.ui.isPause()),
            onZoom: zoom => this.camera.addY(zoom),
            onSwitchCamera: () => this.ui.switchCamera(),
        });
        this.gameObjectsService = new GameObjectsService(this);
        this.particles = new Particles(this);
        this.connection = new Connection(this, 'gohtml.ru');
        this.level = new Level(this);

        this.intervals.setInterval(() => {
            this.ui.setFps(this.renderer.fps, this.renderer.targetFps);
            this.ui.updatePlayerParams()
        }, 1000);

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
                player.addExperience(object.params.bounty);
                player.addMoney(object.params.bounty);
            },
            onDamageTaken: () => this.ui.updatePlayerParams(),
            onLevelUp: () => this.ui.updatePlayerParams(),
        });
    }

    animate() {
        const now = Date.now();
        const deltaTime = this.intervals.getDeltaTime(now);
        this.intervals.update(now);
        const gameTime = this.intervals.getTimePassed();

        if (!this.ui.isPause()) {
            this.gameObjectsService.update(gameTime, deltaTime);
            this.camera.update();
            this.ui.update();
            this.input.update();
            this.level.update();
            this.particles.update();
            this.connection.send(this.getPlayer());
        }

        this.renderer.render(this.scene, this.camera.camera, deltaTime);
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
