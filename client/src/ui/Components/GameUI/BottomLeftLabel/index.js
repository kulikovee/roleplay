import React, { Component } from 'react';

class App extends Component {
    render() {
        const {
            hp,
            hpMax,
            speed,
            damage,
        } = this.props;

        return (
            <div className="label--in-game bottom-left">
                HP {Math.ceil(hp)} / {Math.ceil(hpMax)}
                &nbsp;| Movement Speed: {Math.floor(speed * 100)}%
                &nbsp;| Melee Damage: {damage}
            </div>
        );
    }
}

export default App;