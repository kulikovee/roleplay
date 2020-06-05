import * as THREE from 'three';
import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.clearHpBars = this.clearHpBars.bind(this);

        this.state = { hpBars: [] };
        this.container = React.createRef();

        if (props.setUpdate) {
            props.setUpdate(this.update);
        }

        if (props.setClearHpBars) {
            props.setClearHpBars(this.clearHpBars);
        }
    }

    shouldComponentUpdate () {
        return false;
    }

    clearHpBars() {
        this.container.current.innerHTML = '';
    }

    update() {
        const { units, camera } = this.props.scene;
        const container = this.container.current;
        const player = this.props.scene.getPlayer();

        if (container) {
            const hpBars = units.getUnits().map(unit => ({
                unit,
                id: unit.__game_object_id,
                element: unit.__unit_hp_bar,
            }));

            camera.camera.updateMatrixWorld(true);

            Object.keys(hpBars).forEach((hpBarId) => {
                const hpBar = hpBars[hpBarId];
                const unit = hpBar.unit;
                const unitLevel = unit.getLevel().toString();
                let hpBarElement = unit.__unit_hp_bar;

                if (!hpBarElement) {
                    hpBarElement = document.createElement('div');
                    hpBarElement.className = (
                        'hp-bar ' + (
                            player === unit
                                ? ''
                                : (player.isEnemy(unit) ? 'enemy' : 'friendly')
                        )
                    );
    
                    const levelElement = document.createElement('span');
                    const nameElement = document.createElement('span');
                    const barElement = document.createElement('div');

                    levelElement.innerHTML = unitLevel;
                    levelElement.className = 'level';
                    nameElement.innerHTML = unit.getName();
                    nameElement.className = 'name';
                    barElement.append(document.createElement('div'));

                    hpBarElement.append(levelElement);
                    hpBarElement.append(nameElement);
                    hpBarElement.append(barElement);

                    unit.__unit_hp_bar = hpBarElement;
                    container.append(hpBarElement);
                }

                if (unit.isAlive()) {
                    const unitPosition = unit.position.clone().add(new THREE.Vector3(0, 1.9 * unit.object.scale.y, 0)),
                        distance = player.position.distanceTo(unitPosition),
                        isNearEnough = distance < 20,
                        screenBarPosition = isNearEnough && camera.toScreenPosition(unitPosition),
                        width = Math.min(70, 1000 / distance);

                    hpBarElement.style.display = screenBarPosition.z > 1 || !isNearEnough ? 'none' : 'block';

                    if (isNearEnough) {
                        hpBarElement.style.left = `${screenBarPosition.x}px`;
                        hpBarElement.style.top = `${screenBarPosition.y}px`;
                        hpBarElement.style.width = `${width}px`;
                    }

                    const barContainer = hpBarElement.children[2];
                    const barLine = barContainer.children[0];
                    barLine.style.width = `${Math.round(100 * unit.getHP() / unit.getMaxHP())}%`;
    
                    const levelElement = hpBarElement.children[0];
                    if (levelElement.innerHTML !== levelElement) {
                        levelElement.innerHTML = unit.getLevel();
                    }
                } else if (hpBarElement) {
                    hpBarElement.remove();
                    unit.__unit_hp_bar = null;
                }
            });
        }
    }

    render() {
        return (
            <div className="hp-bars" ref={this.container}></div>
        );
    }
}

export default App;