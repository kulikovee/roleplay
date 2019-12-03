import * as THREE from 'three'
import AutoBindMethods from './AutoBindMethods';

export default class UI extends AutoBindMethods {
    /**
     * @param {Scene} scene
     */
    constructor(scene) {
        super();
        this.scene = scene;
        this.elements = UI.getElements();
        this.pause = false;
        this.isPointerLocked = false;

        this.elements.closeShopButton.onclick = () => this.setPause(false);
        this.elements.buyHpButton.onclick = () => this.buy('hp');
        this.elements.buyTalentHpButton.onclick = () => this.buy('talent-hp');
        this.elements.buyTalentSpeedButton.onclick = () => this.buy('talent-speed');
        this.elements.buyTalentDamageButton.onclick = () => this.buy('talent-damage');
        this.elements.restartButton.onclick = () => this.restart();
        this.elements.switchCameraModeButton.onclick = () => this.switchCamera();
        this.elements.godModeHpButton.onclick = () => this.buy('god-hp');

        this.addPointerLockEvents(this.elements.blockerLabel, this.elements.instructionsLabel);
    }

    update() {
        this.updateCursor();
        this.updateHPBars();
    }

    updateCursor() {
        const { isThirdPerson, cursor: { x, y } } = this.scene.input;
        this.elements.cursor.style.left = isThirdPerson ? '0' : `${x}px`;
        this.elements.cursor.style.top = isThirdPerson ? '0' : `${y}px`;
    }

    updateHPBars() {
        const { units, camera } = this.scene;

        camera.camera.updateMatrixWorld(true);
        const cameraPosition = new THREE.Vector3().setFromMatrixPosition(camera.camera.matrixWorld);

        units.getUnits().forEach((unit) => {
            const element = this.getUnitHpBar(unit);

            if (unit.isAlive()) {
                camera.camera.updateMatrixWorld(true);
                const unitPosition = new THREE.Vector3()
                        .setFromMatrixPosition(unit.object.matrixWorld)
                        .add(new THREE.Vector3(0, 1.8, 0)),
                    distance = cameraPosition.distanceTo(unitPosition),
                    screenBarPosition = camera.toScreenPosition(unitPosition),
                    width = Math.min(70, 1000 / distance);

                element.style.display = screenBarPosition.z > 1 || distance > 20 ? 'none' : 'block';
                element.style.left = `${screenBarPosition.x}px`;
                element.style.top = `${screenBarPosition.y}px`;
                element.style.width = `${width}px`;
                element.children[0].style.width = `${Math.round(100 * unit.params.hp / unit.params.hpMax)}%`;
            } else if (element) {
                element.remove();
            }
        });
    }

    getUnitHpBar(unit) {
        const id = `hp-bars-gameobject-${unit.__game_object_id}`;
        let element = document.getElementById(id);

        if (!element && unit.isAlive()) {
            element = document.createElement('div');
            element.id = id;
            element.className = 'hp-bar';

            const content = document.createElement('div');
            element.append(content);

            this.elements.hpBarsContainer.append(element);
        }

        return element;
    }

    clearHpBars() {
        this.elements.hpBarsContainer.innerHTML = '';
    }

    updatePlayerLabels() {
        if (this.scene.getPlayer()) {
            const player = this.scene.getPlayer();

            this.elements.rightBottomLabel.innerHTML =
                `Exp: ${Math.floor(player.getExperience())} \
                / ${Math.floor(player.getLevelExperience())}  \
                | Talents: ${player.params.unspentTalents}\
                | Level: ${player.getLevel()}`;

            this.elements.rightTopLabel.innerHTML = `$${Math.round(player.params.money)} <br> Position: ${Math.round(player.position.x * 100) / 100}, ${Math.round(player.position.z * 100) / 100}`;
            this.elements.shopTalentLabel.innerHTML = `Talents (${Math.round(player.params.unspentTalents)} unspent talents left):`;
            this.elements.shopMoneyLabel.innerHTML = `Shop ($${Math.round(player.params.money)} left):`;

            this.elements.leftBottomLabel.innerHTML =`
                HP ${Math.ceil(player.params.hp)} / ${Math.ceil(player.params.hpMax)} \
                | Speed: ${Math.floor(player.params.speed * 1000)}% \
                | Damage: ${player.params.damage}
            `;
        }
    }

    setPause(pause = !this.pause) {
        this.updatePlayerLabels();

        this.pause = pause;

        this.elements.pausePane.style.display = this.pause ? 'block' : 'none';

        if (pause) {
            this.exitPointerLock();
        } else {
            this.requestPointerLock();
        }
    }

    switchCamera() {
        const { scene: { input: { isThirdPerson } }, elements: { switchCameraModeButton } } = this;

        switchCameraModeButton.value = isThirdPerson
            ? 'Switch to Third Person Camera'
            : 'Switch to Isometric Camera';

        this.scene.input.isThirdPerson = !isThirdPerson;
        this.scene.camera.update();
    }

    restart() {
        this.restartGame();
        this.setPause(true);
    }

    buy(type) {
        const player = this.scene.getPlayer();

        switch (type) {
            case 'hp':
                if (player.params.money >= 100) {
                    player.params.money -= 100;
                    player.addHP(10);
                }

                break;
            case 'talent-hp':
                if (player.params.unspentTalents) {
                    player.params.unspentTalents--;
                    player.addMaxHP(10);
                }

                break;
            case 'talent-speed':
                if (player.params.unspentTalents) {
                    player.params.unspentTalents--;
                    player.addSpeed(0.005);
                }

                break;
            case 'talent-damage':
                if (player.params.unspentTalents) {
                    player.params.unspentTalents--;
                    player.addDamage(5);
                }

                break;
            case 'god-hp':
                player.addMaxHP(9999);

                break;
            default:
                break;
        }

        this.updatePlayerLabels();
    }

    showRestart() {
        this.elements.restartRow.style.display = 'block';
    }

    startGame() {
        this.elements.restartRow.style.display = 'none';
    }

    restartGame() {
        this.scene.level.restartLevel();
        this.elements.restartRow.style.display = 'none';
        this.scene.camera.update();
        this.clearHpBars();
    }

    static getElements() {
        return {
            // Pause pane
            pausePane: document.getElementById('shop'),

            // Clickable messages on the Pause screen
            blockerLabel: document.getElementById('blocker'),
            instructionsLabel: document.getElementById('instructions'),

            // Mouse cursor in isometric camera mode
            cursor: document.getElementById('cursor'),

            // Container for Units HP bars
            hpBarsContainer: document.getElementById('hp-bars'),

            // Hiding restart container
            restartRow: document.getElementById('restart'),

            // Buttons
            closeShopButton: document.getElementById('close-shop'),
            buyHpButton: document.getElementById('buy-hp'),
            buyTalentHpButton: document.getElementById('buy-talent-hp'),
            buyTalentSpeedButton: document.getElementById('buy-talent-speed'),
            buyTalentDamageButton: document.getElementById('buy-talent-damage'),
            restartButton: document.getElementById('restart-button'),
            switchCameraModeButton: document.getElementById('switch-third-person'),
            godModeHpButton: document.getElementById('god-mode-enable'),

            // Labels
            leftBottomLabel: document.getElementById('hp'),
            rightTopLabel: document.getElementById('money'),
            rightBottomLabel: document.getElementById('exp'),
            shopTalentLabel: document.getElementById('shop-talent'),
            shopMoneyLabel: document.getElementById('shop-money'),
        };
    }
}
