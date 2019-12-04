import * as THREE from 'three';
import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { hpBars: [] };

        if (props.setUpdate) {
            props.setUpdate(this.update);
        }
    }

    update() {
        this.setState({
            hpBars: this.props.scene.gameObjectsService
                .getUnits()
                .filter(unit => unit.isAlive())
                .map(unit => ({ id: unit.__game_object_id, unit }))
        });
    }

    render() {
        const { camera, toScreenPosition } = this.props;
        const { hpBars } = this.state;

        camera.updateMatrixWorld(true);
        const cameraPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

        return (
            <div id="hp-bars">
                {hpBars.map((hpBar) => {
                    const unitPosition = new THREE.Vector3()
                            .setFromMatrixPosition(hpBar.unit.object.matrixWorld)
                            .add(new THREE.Vector3(0, 1.8, 0)),
                        distance = cameraPosition.distanceTo(unitPosition),
                        screenBarPosition = toScreenPosition(unitPosition),
                        width = Math.min(70, 1000 / distance);

                    return (
                        <div
                            key={`hp-bars-gameobject-${hpBar.id}`}
                            className="hp-bar"
                            style={{
                                display: screenBarPosition.z > 1 || distance > 20 ? 'none' : 'block',
                                left: `${screenBarPosition.x}px`,
                                top: `${screenBarPosition.y}px`,
                                width: `${width}px`,
                            }}
                        >
                            <div
                                style={{
                                    width: `${Math.round(100 * hpBar.unit.getHP() / hpBar.unit.getMaxHP())}%`
                                }}
                            ></div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default App;