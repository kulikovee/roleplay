export default class UI {
    constructor(scene) {
        this.scene = scene;
        this.pause = false;

        this.updatePlayerLabels = this.updatePlayerLabels.bind(this);
        this.openShop = this.openShop.bind(this);
        this.closeShop = this.closeShop.bind(this);
        this.buy = this.buy.bind(this);
        this.startGame = this.startGame.bind(this);
        this.restart = this.restart.bind(this);

        this.cross = document.getElementById('cross');
        document.getElementById('close-shop').onclick = () => this.closeShop();
        document.getElementById('buy-hp').onclick = () => this.buy('hp');
        document.getElementById('buy-speed').onclick = () => this.buy('speed');
        document.getElementById('buy-damage').onclick = () => this.buy('damage');
        document.getElementById('restart-button').onclick = () => this.restart();

        this.scene.renderer.addPointerLockEvents(
            document.getElementById('blocker'),
            document.getElementById('instructions'),
        );
    }

    update() {
        if (this.scene.player) {
            const crossPivot = this.scene.player.object.getObjectByName('crossPivot');
            const position = this.scene.camera.toScreenPosition(crossPivot);
            this.cross.style.left = `${position.x}px`;
            this.cross.style.top = `${position.y}px`;
        }
    }

    updatePlayerLabels() {
        if (this.scene.player) {
            document.getElementById('kills').innerHTML =
                `Kills: ${this.scene.player.params.kills} | Level: ${this.scene.level.getLevel()}`;

            document.getElementById('score').innerHTML = `$${Math.round(this.scene.player.params.score)}`;

            document.getElementById('hp').innerHTML =`
                HP +${Math.round(this.scene.player.params.hp)} \
                | Speed: ${Math.round(this.scene.player.params.speed * 1000)}% \
                | Damage: ${this.scene.player.params.damage}
            `;
        }
    }

    openShop() {
        this.pause = true;
        this.scene.renderer.exitPointerLock();
        document.getElementById('shop').style.display = 'block';
    }

    closeShop() {
        this.pause = false;
        this.scene.renderer.requestPointerLock();
        document.getElementById('shop').style.display = 'none';
    }

    restart() {
        this.startGame();
        this.openShop();
    }

    buy(type) {
        switch (type) {
            case 'hp':
                if (this.scene.player.params.score >= 100) {
                    this.scene.player.params.score -= 100;
                    this.scene.player.params.hp += 10;
                }

                break;
            case 'speed':
                if (this.scene.player.params.score >= 200) {
                    this.scene.player.params.score -= 200;
                    this.scene.player.params.speed += 0.005;
                }

                break;
            case 'damage':
                if (this.scene.player.params.score >= 250) {
                    this.scene.player.params.score -= 250;
                    this.scene.player.params.damage += 25;
                }

                break;
            default:
                break;
        }

        this.scene.ui.updatePlayerLabels();
    }

    showRestart() {
        document.getElementById('restart').style.display = 'block';
    }

    startGame() {
        this.scene.gameObjectsService.removeAllGameObjects();
        this.scene.createPlayer({
            onCreate: () => {
                this.updatePlayerLabels();
            }
        });

        document.getElementById('restart').style.display = 'none';
        this.scene.ui.updatePlayerLabels();
    }
}
