import React, { Component } from 'react';
import * as THREE from 'three';
import TopRight from './Components/TopRightLabel';
import BottomRight from './Components/BottomRightLabel';
import BottomLeft from './Components/BottomLeftLabel';
import Cursor from './Components/Cursor';
import ActionLabel from './Components/ActionLabel';
import HpBars from './Components/HpBars';
import Pause from './Components/Pause';
import  {
    addPointerLockEvents,
    onPointerLockChange,
    exitPointerLock,
    requestPointerLock
} from './Utilities/PointerLocks';

import Renderer from '../js/Renderer';
import Scene from '../js/Scene';

class App extends Component {
    constructor(props) {
        super(props);

        this.initWebGL = this.initWebGL.bind(this);
        this.getAPI = this.getAPI.bind(this);
        this.update = this.update.bind(this);
        this.setPause = this.setPause.bind(this);
        this.clearHpBars = this.clearHpBars.bind(this);
        this.switchCamera = this.switchCamera.bind(this);
        this.buy = this.buy.bind(this);
        this.setRestartButtonVisible = this.setRestartButtonVisible.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.updatePlayerParams = this.updatePlayerParams.bind(this);
        this.render = this.render.bind(this);

        this.state = {
            pause: true,
            showRestart: false,
            hpBars: [],
            isPointerLocked: false,

            // Player
            unspentTalents: 0,
            hp: 0,
            hpMax: 0,
            speed: 0,
            damage: 0,
            money: 0,
            experience: 0,
            levelExperience: 0,
            position: new THREE.Vector3(),
        };

        this.container = React.createRef();
    }

    componentDidMount() {
        this.initWebGL();
    }

    initWebGL() {
        if (this.container.current) {
            THREE.Cache.enabled = true;

            const container = this.container.current,
                renderer = new Renderer(container),
                scene = new Scene(renderer, this.getAPI()),
                onResize = () => {
                    scene.camera.camera.aspect = container.clientWidth / container.clientHeight;
                    scene.camera.camera.updateProjectionMatrix();
                    renderer.setSize(container.clientWidth, container.clientHeight);
                },
                nonPauseRequestPointerLock = () => !scene.ui.isPause() && requestPointerLock();

            window.addEventListener('resize', onResize, false);
            document.body.addEventListener('click', nonPauseRequestPointerLock, false);
            addPointerLockEvents({
                onPointerLockChange: onPointerLockChange((isPointerLocked) => {
                    console.log('onPointerLockChange', {
                        statePointerLock: this.state.isPointerLocked,
                        isPointerLocked,
                    });

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
                })
            });

            this.scene = scene;
        }
    }

    getAPI() {
        return {
            setRestartButtonVisible: this.setRestartButtonVisible,
            setPause: this.setPause,
            restartGame: this.restartGame,
            isPause: () => this.state.pause,
            update: this.update,
            updatePlayerParams: this.updatePlayerParams,
            clearHpBars: this.clearHpBars,
        };
    }

    update() {
        if (!this.scene || !this.scene.input || !this.scene.getPlayer()) {
            return;
        }

        this.setState({
            cursor: {
                ...this.scene.input.cursor
            },
            hpBars: this.scene.gameObjectsService
                .getUnits()
                .filter(unit => unit.isAlive())
                .map(unit => ({ id: unit.__game_object_id, unit })),
        });
    }

    setPause(pause = !this.state.pause) {
        this.setState({ pause });

        if (pause) {
            exitPointerLock();
        } else {
            requestPointerLock();
        }
    }

    clearHpBars() {
        this.setState({ hpBars: [] });
    }

    switchCamera() {
        const { isThirdPerson } = this.state;

        this.setState({ isThirdPerson: !isThirdPerson }, (state) => {
            this.scene.input.isThirdPerson = state.isThirdPerson;
            this.scene.camera.update();
        });
    }

    buy(type) {
        const player = this.scene.getPlayer();
        const unspentTalents = player.getUnspentTalents();

        switch (type) {
            case 'hp':
                if (player.getMoney() >= 100) {
                    player.addMoney(-100);
                    player.addHP(10);
                }
                break;
            case 'talent-hp':
                if (unspentTalents > 0) {
                    player.decreaseUnspentTalents();
                    player.addMaxHP(10);
                }
                break;
            case 'talent-speed':
                if (unspentTalents > 0) {
                    player.decreaseUnspentTalents();
                    player.addSpeed(0.005);
                }
                break;
            case 'talent-damage':
                if (unspentTalents > 0) {
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

        this.updatePlayerParams();
    }

    updatePlayerParams() {
        if (this.scene) {
            const player = this.scene.getPlayer();

            if (player) {
                this.setState({
                    level: player.getLevel(),
                    unspentTalents: player.getUnspentTalents(),
                    hp: player.getHP(),
                    hpMax: player.getMaxHP(),
                    speed: player.getSpeed(),
                    damage: player.getDamage(),
                    money: player.getMoney(),
                    experience: player.getExperience(),
                    levelExperience: player.getLevelExperience(),
                    position: player.position,
                });
            }
        }
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
            hp,
            hpMax,
            speed,
            damage,
            hpBars,
            pause,
            money,
            unspentTalents,
            showRestart,
            level,
            experience,
            levelExperience,
            isThirdPerson,
            position,
            action,
        } = this.state;

        return (
            <div>
                <div ref={this.container}></div>
                {this.scene && (
                    <div>
                        <TopRight
                            money={money}
                            position={position}
                        />
                        <BottomRight
                            unspentTalents={unspentTalents}
                            level={level}
                            experience={experience}
                            levelExperience={levelExperience}
                        />
                        <BottomLeft
                            hp={hp}
                            hpMax={hpMax}
                            speed={speed}
                            damage={damage}
                        />
                        {isThirdPerson ? <Cursor x={cursor.x} y={cursor.y} /> : null}
                        {action && <ActionLabel action={action} />}
                        {pause && <Pause
                            isThirdPerson={isThirdPerson}
                            unspentTalents={unspentTalents}
                            money={money}
                            showRestart={showRestart}
                            setPause={this.setPause}
                            switchCamera={this.switchCamera}
                            restartGame={this.restartGame}
                            buy={this.buy}
                        />}
                        {this.scene.camera && <HpBars
                            hpBars={hpBars}
                            camera={this.scene.camera.camera}
                            toScreenPosition={this.scene.camera.toScreenPosition}
                        />}
                    </div>
                )}
            </div>
        );
    }
}

export default App;