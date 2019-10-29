import { AI } from '../GameObjects.js';

export default class Level1 {
    constructor(scene) {
        this.scene = scene;
        this.lastBadGuyCreated = Date.now();
        this.levelThreshold = 15;

        this.getLevel = this.getLevel.bind(this);
        this.startLevel = this.startLevel.bind(this);
        this.createBadGuyByTimeout = this.createBadGuyByTimeout.bind(this);
        this.createBadGuy = this.createBadGuy.bind(this);
    }

    startLevel() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(this.createBadGuyByTimeout, 500);
        this.scene.ui.startGame();
        this.scene.ui.openShop();
    }

    createBadGuyByTimeout() {
        const level = this.getLevel(),
            player = this.scene.player,
            badGuyTimeout = 5000 - level * 500;

        if (player && !this.scene.ui.pause && (Date.now() - this.lastBadGuyCreated >= badGuyTimeout)) {
            this.lastBadGuyCreated = Date.now();
            this.createBadGuy();
        }
    }

    createBadGuy() {
        const level = this.getLevel(),
            player = this.scene.player,
            gameObjectsService = this.scene.gameObjectsService;

        this.scene.loadObj({
            baseUrl: './assets/enemy',
            callback: (object) => {
                const badGuy = gameObjectsService.hookGameObject(new AI({
                    object,
                    target: this.scene.player,
                    speed: 0.04 + level * 0.01 + player.params.speed * 0.5,
                    damage: 5 + level * 5,
                    hp: 140 + level * 30,
                    fire: () => gameObjectsService.fire(badGuy),
                    destroy: () => gameObjectsService.destroyGameObject(badGuy),
                }));

                badGuy.position.set(
                    player.position.x + 1000 * (Math.random() - 0.5),
                    player.position.y + 1000 * (Math.random() - 0.5),
                    player.position.z + 1000 * (Math.random() - 0.5)
                );

                badGuy.object.scale.set(2.5, 2.5, 2.5);
            }
        });
    }

    getLevel() {
        return (
            1 + Math.floor(
                (this.scene.player ? this.scene.player.params.kills : 0) / this.levelThreshold
            )
        );
    }
}
