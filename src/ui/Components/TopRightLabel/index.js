import React, { Component } from 'react';

class App extends Component {
    render() {
        const { position, money, fps, targetFps } = this.props;

        return (
            <div id="money">
                ${money}<br />
                Position: {position && `${this.getFormattedValue(position.x)}, ${this.getFormattedValue(position.z)}`}<br />
                FPS: {Math.round(fps)} (Target: {Math.round(targetFps)})
            </div>
        );
    }

    getFormattedValue(value) {
        return `${value >= 0 ? '+' : ''}${(Math.round(value * 100) / 100).toFixed(2)}`;
    }
}

export default App;