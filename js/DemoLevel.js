import { AI } from './GameObjects.js';

export default class DemoLevel {
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
        const level = this.getLevel();

        if (this.scene.player && !this.pause) {
            this.scene.loadObj({
                baseUrl: "https://gohtml.ru/assets/enemy",
                callback: (object) => {
                    const badGuy = this.scene.gameLogicService.createGameObject(
                        AI,
                        object,
                        {
                            target: this.scene.player.object,
                            speed: 0.04 + level * 0.01 + this.scene.player.speed * 0.5,
                            damage: 5 + level * 5,
                            hp: 70 + level * 30
                        },
                    );

                    badGuy.position.set(
                        this.scene.player.position.x + 1000 * (Math.random() - 0.5),
                        this.scene.player.position.y + 1000 * (Math.random() - 0.5),
                        this.scene.player.position.z + 1000 * (Math.random() - 0.5)
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
                (this.scene.player ? this.scene.player.kills : 0) / this.levelThreshold
            )
        );
    }
}
