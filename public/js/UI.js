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
        this.openShopOnExitPointerLock = this.openShopOnExitPointerLock.bind(this);

        this.scene = scene;
        this.pause = false;

        this.cross = document.getElementById('cross');
        document.getElementById('close-shop').onclick = () => this.closeShop();
        document.getElementById('buy-hp').onclick = () => this.buy('hp');
        document.getElementById('buy-speed').onclick = () => this.buy('speed');
        document.getElementById('buy-damage').onclick = () => this.buy('damage');
        document.getElementById('restart-button').onclick = () => this.restart();

        this.addPointerLockEvents(
            document.getElementById('blocker'),
            document.getElementById('instructions'),
        );

        if ("onpointerlockchange" in document) {
            document.addEventListener('pointerlockchange', this.openShopOnExitPointerLock, false);
        } else if ("onmozpointerlockchange" in document) {
            document.addEventListener('mozpointerlockchange', this.openShopOnExitPointerLock, false);
        }
    }

    update() {
        if (this.scene.player) {
            const crossPivot = this.scene.player.object.crossPivot;

            if (crossPivot) {
                const position = this.scene.camera.toScreenPosition(crossPivot);
                this.cross.style.left = `${position.x}px`;
                this.cross.style.top = `${position.y}px`;
            }
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

    openShopOnExitPointerLock() {
        setTimeout(() => {
            if(
                document.pointerLockElement !== document.body
                && document.mozPointerLockElement !== document.body
            ) {
                !this.pause && this.openShop();
            }
        }, 100);
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

    addPointerLockEvents(blocker, instructions) {
        const element = document.body;

        if (
            'pointerLockElement' in document ||
            'mozRequestPointerLock' in document ||
            'webkitRequestPointerLock' in document
        ) {
            const pointerlockchange = function (event) {
                if (
                    document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element
                ) {
                    blocker.style.display = 'none';
                } else {
                    blocker.style.display = '-webkit-box';
                    blocker.style.display = '-moz-box';
                    blocker.style.display = 'box';

                    instructions.style.display = '';
                }
            };

            const pointerlockerror = function (event) {
                instructions.style.display = '';
            };

            document.addEventListener('pointerlockchange', pointerlockchange, false);
            document.addEventListener(
                'mozpointerlockchange',
                pointerlockchange,
                false
            );
            document.addEventListener(
                'webkitpointerlockchange',
                pointerlockchange,
                false
            );
        } else {
            instructions.innerHTML +=
                'Your browser doesn\'t seem to support Pointer Lock API<br>';
        }

        if (
            'fullscreenElement' in document ||
            'mozRequestFullScreenElement' in document ||
            'webkitFullscreenElement' in document
        ) {
            blocker.addEventListener(
                'click',
                function () {
                    document.addEventListener(
                        'fullscreenchange',
                        fullscreenchange,
                        false
                    );
                    document.addEventListener(
                        'mozfullscreenchange',
                        fullscreenchange,
                        false
                    );
                    document.addEventListener(
                        'webkitfullscreenchange',
                        fullscreenchange,
                        false
                    );

                    element.requestFullscreen =
                        element.requestFullscreen ||
                        element.webkitRequestFullscreen ||
                        element.mozRequestFullScreen;

                    element.requestFullscreen();
                },
                false
            );

            const fullscreenchange = function (event) {
                if (
                    document.fullscreenElement === element ||
                    document.mozFullScreenElement === element ||
                    document.webkitFullscreenElement === element
                ) {
                    document.removeEventListener('fullscreenchange', fullscreenchange);
                }
            };
        } else {
            instructions.innerHTML +=
                'Your browser doesn\'t seem to support Fullscreen API<br>';
        }
    }
}
