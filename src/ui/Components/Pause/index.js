import React, { Component } from 'react';
import BottomLeft from "../BottomLeftLabel/index";

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
            <React.Fragment>
                <div id="shop">
                    <div className="row">
                        <label>Game is paused</label>
                    </div>
                    <div className="row">
                        {showRestart
                            ? (
                                <div id="restart">
                                    <input id="restart-button" type="button" value="Restart" onClick={() => restartGame()} />
                                </div>
                            )
                            : null
                        }
                    </div>
                    <div className="row">
                        <div><input id="close-shop" type="button" value="Resume" onClick={() => setPause(false)} /></div>
                    </div>
                    <div className="row">
                        <div>
                            <input
                                id="switch-third-person"
                                type="button"
                                value={
                                    isThirdPerson
                                        ? 'Switch to Third Person Camera'
                                        : 'Switch to Isometric Camera'
                                }
                                onClick={() => switchCamera()}
                            />
                        </div>
                    </div>

                    <div className="row title">
                        <label id="shop-talent">Talents ({unspentTalents} unspent talents left):</label>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-hp" type="button" value="+10 MAX HP" onClick={() => buy('talent-hp')} /></div>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-speed" type="button" value="Speed +5%" onClick={() => buy('talent-speed')} /></div>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-damage" type="button" value="Damage +5" onClick={() => buy('talent-damage')} /></div>
                    </div>


                    <div className="row title">
                        <label id="shop-money">Shop ({money} left):</label>
                    </div>
                    <div className="row">
                        <div><input id="buy-hp" type="button" value="Buy: Heal +10 HP ($100)" onClick={() => buy('hp')}  /></div>
                    </div>


                    <div className="row title">
                        <label id="god-mode">God Mode:</label>
                    </div>
                    <div className="row">
                        <div><input id="god-mode-enable" type="button" value="Add 9999 HP" onClick={() => buy('god-hp')} /></div>
                    </div>
                </div>
                <div id="blocker">
                    <div id="instructions">
                        <span className="instructions-title">Click here to fullscreen</span>
                        <br />
                        (Press W,A,S,D to move; Press Space to move up; Use mouse to rotate; Left Mouse Button to
                        attack, Right to fire)
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default App;