import { AI } from '../GameObjects.js';

export default class Level1 {
    constructor(scene) {
        this.scene = scene;

        this.levelThreshold = 15;
        this.startBadGuysConveyor = this.startBadGuysConveyor.bind(this);
        this.getLevel = this.getLevel.bind(this);
        this.startLevel = this.startLevel.bind(this);
    }

    startLevel() {
        this.startBadGuysConveyor();
        this.scene.ui.startGame();
        this.scene.ui.openShop();
    }

    startBadGuysConveyor() {
        const gameObjectsService = this.scene.gameObjectsService,
            level = this.getLevel(),
            player = this.scene.player;

        if (player && !this.scene.ui.pause) {
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

        const badGuyTimeout = 5000 - level * 500;

        setTimeout(this.startBadGuysConveyor, badGuyTimeout > 500 ? badGuyTimeout : 500);
    }

    getLevel() {
        return (
            1 + Math.floor(
                (this.scene.player ? this.scene.player.params.kills : 0) / this.levelThreshold
            )
        );
    }
}
