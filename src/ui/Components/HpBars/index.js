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

        if (container) {
            const hpBars = units.getUnits().map(unit => ({
                unit,
                id: unit.__game_object_id,
                element: unit.__unit_hp_bar,
            }));

            camera.camera.updateMatrixWorld(true);
            const cameraPosition = new THREE.Vector3().setFromMatrixPosition(camera.camera.matrixWorld);

            Object.keys(hpBars).forEach((hpBarId) => {
                const hpBar = hpBars[hpBarId];
                const unit = hpBar.unit;
                let element = unit.__unit_hp_bar;

                if (!element) {
                    element = document.createElement('div');
                    element.className = 'hp-bar';
                    element.append(document.createElement('div'));
                    unit.__unit_hp_bar = element;
                    container.append(element);
                }

                if (unit.isAlive()) {
                    const unitPosition = unit.position.clone().add(new THREE.Vector3(0, 1.8, 0)),
                        distance = cameraPosition.distanceTo(unitPosition),
                        isNearEnough = distance < 20,
                        screenBarPosition = isNearEnough && camera.toScreenPosition(unitPosition),
                        width = Math.min(70, 1000 / distance);

                    element.style.display = screenBarPosition.z > 1 || !isNearEnough ? 'none' : 'block';

                    if (isNearEnough) {
                        element.style.left = `${screenBarPosition.x}px`;
                        element.style.top = `${screenBarPosition.y}px`;
                        element.style.width = `${width}px`;
                    }

                    element.children[0].style.width = `${Math.round(100 * unit.getHP() / unit.getMaxHP())}%`;
                } else if (element) {
                    element.remove();
                    unit.__unit_hp_bar = null;
                }
            });
        }
    }

    render() {
        return (
            <div id="hp-bars" ref={this.container}></div>
        );
    }
}

export default App;