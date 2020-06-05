import React, { Component } from 'react';
import Button from '../../Common/Button';

class App extends Component {
    render() {
        const {
            isThirdPerson,
            unspentTalents,
            money,
            showRestart,
            switchCamera,
            restartGame,
            setPause,
            buy,
        } = this.props;

        console.log('Render Pause', { showRestart });

        return (
            <div className="overlay theme">
                <div className="menu">
                    <div className="row">
                        <label>Game is paused</label>
                    </div>

                    <hr />
                    <div className="row">
                        {showRestart
                            ? (
                                <div>
                                    <Button onClick={() => restartGame()}>Restart</Button>
                                </div>
                            )
                            : null
                        }
                    </div>
                    <div className="row">
                        <div>
                            <Button onClick={() => setPause(false)}>
                                Resume
                            </Button>
                        </div>
                    </div>

                    <div className="row">
                        <div>
                            <Button onClick={() => switchCamera()}>
                                {isThirdPerson
                                    ? 'Switch to Third Person Camera'
                                    : 'Switch to Isometric Camera'
                                }
                            </Button>
                        </div>
                    </div>

                    <hr />
                    <div className="row title">
                        <label>Talents ({unspentTalents} unspent talents left):</label>
                    </div>
                    <div className="row">
                        <div>
                            <Button onClick={() => buy('talent-hp')}>
                                +10 MAX HP
                            </Button>
                        </div>
                    </div>
                    <div className="row">
                        <div>
                            <Button onClick={() => buy('talent-speed')}>
                                Speed +5%
                            </Button>
                        </div>
                    </div>
                    <div className="row">
                        <div>
                            <Button onClick={() => buy('talent-damage')}>
                                Damage +5
                            </Button>
                        </div>
                    </div>

                    <hr />
                    <div className="row title">
                        <label>Shop (${money} left):</label>
                    </div>
                    <div className="row">
                        <div>
                            <Button onClick={() => buy('hp')}>
                                Buy: Heal +10 HP ($100)
                            </Button>
                        </div>
                    </div>
                </div>
                {/*<div>
                    <div className="h2">
                        <span className="h1">Click here to fullscreen</span>
                        <br />
                        (Press W,A,S,D to move; Press Space to move up; Use mouse to rotate; Left Mouse Button to
                        attack, Right to fire)
                    </div>
                </div>*/}
            </div>
        );
    }
}

export default App;