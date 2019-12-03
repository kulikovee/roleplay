import React, { Component } from 'react';
import BottomLeft from "../BottomLeftLabel/index";

class App extends Component {
    render() {
        return (
            <React.Fragment>
                <div id="shop">
                    <div className="row">
                        <label>Game is paused</label>
                    </div>
                    <div className="row">
                        <div id="restart">
                            <input id="restart-button" type="button" value="Restart" />
                        </div>
                    </div>
                    <div className="row">
                        <div><input id="close-shop" type="button" value="Resume" /></div>
                    </div>
                    <div className="row">
                        <div><input id="switch-third-person" type="button" value="Switch to Isometric Camera" /></div>
                    </div>

                    <div className="row title">
                        <label id="shop-talent">Talents (0 unspent talents left):</label>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-hp" type="button" value="+10 MAX HP" /></div>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-speed" type="button" value="Speed +5%" /></div>
                    </div>
                    <div className="row">
                        <div><input id="buy-talent-damage" type="button" value="Damage +5" /></div>
                    </div>


                    <div className="row title">
                        <label id="shop-money">Shop ($500 left):</label>
                    </div>
                    <div className="row">
                        <div><input id="buy-hp" type="button" value="Buy: Heal +10 HP ($100)" /></div>
                    </div>


                    <div className="row title">
                        <label id="god-mode">God Mode:</label>
                    </div>
                    <div className="row">
                        <div><input id="god-mode-enable" type="button" value="Add 9999 HP" /></div>
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