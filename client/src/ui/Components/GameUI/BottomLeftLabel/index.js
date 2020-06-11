import React, { Component } from 'react';

class App extends Component {
    render() {
        const {
            hp,
            hpMax,
            speed,
            damage,
            fireDamage,
        } = this.props;

        return (
            <div className="label--in-game bottom-left">
                HP {Math.ceil(hp)} / {Math.ceil(hpMax)}<br />
                Movement Speed: {Math.floor(speed * 100)}%<br />
                Melee Damage: {damage}<br />
                Ranged Damage: {fireDamage}
            </div>
        );
    }
}

export default App;