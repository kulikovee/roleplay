import React, { Component } from 'react';
import * as THREE from 'three';
import TopRight from './Components/TopRightLabel';
import BottomRight from './Components/BottomRightLabel';
import BottomLeft from './Components/BottomLeftLabel';
import WebGLContainer from './Components/WebGLContainer';
import Cursor from './Components/Cursor';
import ActionLabel from './Components/ActionLabel';
import HpBars from './Components/HpBars';
import Pause from './Components/Pause';
import  { onPointerLockChange } from './Utilities/PointerLocks';

import Renderer from '../js/Renderer';
import Scene from '../js/Scene';

class App extends Component {
    state = {
        pause: true,
        money: 501,
        talents: 3,
        showRestart: false,
        hpBars: [],
        isPointerLocked: false,
    };

    componentDidMount() {
        THREE.Cache.enabled = true;

        const container = document.getElementById('container'),
            renderer = new Renderer(container),
            scene = new Scene(renderer, this.getAPI()),
            onResize = () => {
                scene.camera.camera.aspect = container.clientWidth / container.clientHeight;
                scene.camera.camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            },
            requestPointerLock = () => !scene.ui.pause && scene.ui.requestPointerLock();

        window.addEventListener('resize', onResize, false);
        document.body.addEventListener('click', requestPointerLock, false);

        this.scene = scene;

        onPointerLockChange((isPointerLocked) => {
            if (this.state.isPointerLocked === isPointerLocked) {
                return;
            }

            this.setState({ isPointerLocked });

            if (isPointerLocked) {
                this.scene.input.cursor.x = this.scene.input.mouse.x;
                this.scene.input.cursor.y = this.scene.input.mouse.y;
                this.elements.blockerLabel.style.display = 'none';
            } else {
                this.elements.blockerLabel.style.display = 'inline-block';
                this.elements.instructionsLabel.style.display = '';
                this.setPause(true);
            }
        });
    }

    getAPI() {
        return {
            increaseTalents: count => this.setState({ talents: this.state.talents + count }),
            increaseMoney: count => this.setState({ money: this.state.money + count }),
            setMoney: money => this.setState({ money }),
            setTalents: talents => this.setState({ talents }),
            learnTalentHp: () => null,
            learnTalentSpeed: () => null,
            learnTalentDamage: () => null,
            buyHp: () => null,
            setRestartButtonVisible: this.setRestartButtonVisible,
            setPause: this.setPause,
            restartGame: this.restartGame,
            setState: state => this.setState(state),
            getState: () => this.state,
            buy: this.buy,
            clearHpBars: this.clearHpBars,
        };
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
        const id = unit.__game_object_id;
        let hpBar = this.state.hpBars.find(bar => bar.id === id);

        if (!hpBar && unit.isAlive()) {
            hpBar = {
                id,
                unit,
            };

            this.setState({ hpBars: [...this.state.hpBars, hpBar]})
        }

        return hpBar;
    }

    setPause(pause = !this.state.pause) {
        this.updatePlayerLabels();

        this.setState({ pause });

        if (pause) {
            this.exitPointerLock();
        } else {
            this.requestPointerLock();
        }
    }

    clearHpBars() {
        this.setState({ hpBars: [] });
    }

    switchCamera() {
        const { scene: { input: { isThirdPerson } }, elements: { switchCameraModeButton } } = this;

        switchCameraModeButton.value = isThirdPerson
            ? 'Switch to Third Person Camera'
            : 'Switch to Isometric Camera';

        this.scene.input.isThirdPerson = !isThirdPerson;
        this.scene.camera.update();
    }

    buy(type) {
        const player = this.scene.getPlayer();
        const unspentTalents = player.getUnspentTalents();

        switch (type) {
            case 'hp':
                if (player.params.money >= 100) {
                    player.params.money -= 100;
                    player.addHP(10);
                }

                break;
            case 'talent-hp':
                if (unspentTalents) {
                    player.decreaseUnspentTalents();
                    player.addMaxHP(10);
                }

                break;
            case 'talent-speed':
                if (unspentTalents) {
                    player.decreaseUnspentTalents();
                    player.addSpeed(0.005);
                }

                break;
            case 'talent-damage':
                if (unspentTalents) {
                    player.decreaseUnspentTalents();
                    player.addDamage(5);
                }

                break;
            case 'god-hp':
                player.addMaxHP(9999);

                break;
            default:
                break;
        }

        this.setState({
           unspentTalents: player.getUnspentTalents(),
           hp: player.getHP(),
           hpMax: player.getMaxHP(),
           speed: player.getSpeed(),
           damage: player.getDamage(),
        });
    }

    setRestartButtonVisible(showRestart) {
        this.setState({ showRestart });
    }

    restartGame() {
        this.scene.level.restartLevel();
        this.scene.camera.update();
        this.setState({ hpBars: [], showRestart: true });
    }

    render() {
        const {
            hpBars,
            pause,
            money,
            talents,
            showRestart,
        } = this.state;

        return (
            <div>
                <TopRight money={money} />
                <BottomRight talents={talents} />
                <BottomLeft />
                <WebGLContainer />
                <Cursor />
                <ActionLabel />
                <Pause pause={pause} showRestart={showRestart} />
                <HpBars
                    hpBars={hpBars}
                    camera={this.scene.camera.camera}
                    toScreenPosition={this.scene.camera.toScreenPosition}
                />
            </div>
        );
    }
}

export default App;