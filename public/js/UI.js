export default class UI {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        this.updatePlayerLabels = this.updatePlayerLabels.bind(this);
        this.openShop = this.openShop.bind(this);
        this.closeShop = this.closeShop.bind(this);
        this.buy = this.buy.bind(this);
        this.startGame = this.startGame.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.restart = this.restart.bind(this);
        this.requestPointerLock = this.requestPointerLock.bind(this);
        this.addPointerLockEvents = this.addPointerLockEvents.bind(this);
        this.onPointerLockChange = this.onPointerLockChange.bind(this);
        this.onFullscreenChange = this.onFullscreenChange.bind(this);

        this.scene = scene;
        this.pause = false;
        this.isPointerLocked = false;
        this.cursor = document.getElementById('cursor');

        document.getElementById('close-shop').onclick = () => this.closeShop();
        document.getElementById('buy-hp').onclick = () => this.buy('hp');
        document.getElementById('buy-speed').onclick = () => this.buy('speed');
        document.getElementById('buy-damage').onclick = () => this.buy('damage');
        document.getElementById('restart-button').onclick = () => this.restart();
        document.getElementById('switch-third-person').onclick = () => this.switchCamera();

        this.addPointerLockEvents(
            document.getElementById('blocker'),
            document.getElementById('instructions'),
        );
    }

    update() {
        if (this.scene.input.isThirdPerson) {
            this.cursor.style.left = '0';
            this.cursor.style.top = '0';
        } else {
            this.cursor.style.left = `${this.scene.input.cursor.x}px`;
            this.cursor.style.top = `${this.scene.input.cursor.y}px`;
        }
    }

    updatePlayerLabels() {
        if (this.scene.player) {
            document.getElementById('exp').innerHTML =
                `Exp: ${this.scene.player.getExperience()} | Level: ${this.scene.player.getLevel()}`;

            document.getElementById('score').innerHTML = `$${Math.round(this.scene.player.params.score)}`;
            document.getElementById('shop-score').innerHTML = `Shop ($${Math.round(this.scene.player.params.score)} left):`;

            document.getElementById('hp').innerHTML =`
                HP +${Math.round(this.scene.player.params.hp)} \
                | Speed: ${Math.round(this.scene.player.params.speed * 1000)}% \
                | Damage: ${this.scene.player.params.damage}
            `;
        }
    }

    openShop() {
        this.pause = true;
        this.exitPointerLock();
        document.getElementById('shop').style.display = 'block';
    }

    closeShop() {
        this.pause = false;
        this.requestPointerLock();
        document.getElementById('shop').style.display = 'none';
    }

    switchCamera() {
        this.scene.input.isThirdPerson = !this.scene.input.isThirdPerson;
    }

    restart() {
        this.restartGame();
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

        this.updatePlayerLabels();
    }

    showRestart() {
        document.getElementById('restart').style.display = 'block';
    }

    startGame() {
        document.getElementById('restart').style.display = 'none';
        this.updatePlayerLabels();
    }

    restartGame() {
        this.scene.level.restartLevel();
        document.getElementById('restart').style.display = 'none';
        this.updatePlayerLabels();
    }

    requestPointerLock() {
        const element = document.body;

        if (
            'pointerLockElement' in document ||
            'mozRequestPointerLock' in document ||
            'webkitRequestPointerLock' in document
        ) {
            element.requestPointerLock =
                element.requestPointerLock ||
                element.mozRequestPointerLock ||
                element.webkitRequestPointerLock;

            if (element.requestPointerLock) {
                element.requestPointerLock();
            }
        }
    }

    exitPointerLock() {
        const element = document;

        if (
            'pointerLockElement' in document ||
            'mozRequestPointerLock' in document ||
            'webkitRequestPointerLock' in document
        ) {
            element.exitPointerLock =
                element.exitPointerLock ||
                element.mozExitPointerLock ||
                element.webkitExitPointerLock;

            if (element.exitPointerLock) {
                element.exitPointerLock();
            }
        }
    }

    onPointerLockChange() {
        setTimeout(() => {
            const isPointerLocked = (
                document.pointerLockElement === document.body
                || document.mozPointerLockElement === document.body
                || document.webkitPointerLockElement === document.body
            );

            if (this.isPointerLocked === isPointerLocked) {
                return;
            }

            if (isPointerLocked) {
                this.scene.input.cursor.x = this.scene.input.mouse.x;
                this.scene.input.cursor.y = this.scene.input.mouse.y;
                blocker.style.display = 'none';
                this.isPointerLocked = true;
            } else {
                blocker.style.display = 'inline-block';
                instructions.style.display = '';
                this.isPointerLocked = false;

                this.openShop();
            }
        }, 100);
    }

    onFullscreenChange(event) {
        if (
            document.fullscreenElement === document.body
            || document.mozFullScreenElement === document.body
            || document.webkitFullscreenElement === document.body
        ) {
            document.removeEventListener('fullscreenchange', this.onFullscreenChange);
        }
    }

    addPointerLockEvents(blocker, instructions) {
        if (
            'pointerLockElement' in document
            || 'onpointerlockchange' in document
            || 'mozRequestPointerLock' in document
            || 'webkitRequestPointerLock' in document
        ) {
            document.addEventListener('pointerlockchange', this.onPointerLockChange, false);
            document.addEventListener('mozpointerlockchange', this.onPointerLockChange, false );
            document.addEventListener('webkitpointerlockchange', this.onPointerLockChange, false );
        } else {
            instructions.innerHTML +=
                'Your browser doesn\'t seem to support Pointer Lock API<br>';
        }

        if (
            'fullscreenElement' in document
            || 'mozRequestFullScreenElement' in document
            || 'webkitFullscreenElement' in document
        ) {
            blocker.addEventListener(
                'click',
                () => {
                    document.addEventListener('fullscreenchange', this.onFullscreenChange, false);
                    document.addEventListener('mozfullscreenchange', this.onFullscreenChange, false);
                    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange, false);

                    document.body.requestFullscreen =
                        document.body.requestFullscreen ||
                        document.body.webkitRequestFullscreen ||
                        document.body.mozRequestFullScreen;

                    document.body.requestFullscreen();
                },
                false
            );
        } else {
            instructions.innerHTML += 'Your browser doesn\'t seem to support Fullscreen API<br>';
        }
    }
}
