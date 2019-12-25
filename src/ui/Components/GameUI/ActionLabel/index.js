import React, { Component } from 'react';

class App extends Component {
    render() {
        const { action, isVisible } = this.props;
        return (
            <div className={`notification label--in-game no-background h2 monospace top-center ${isVisible ? 'visible' : 'hidden'}`}>
                {action}
            </div>
        );
    }
}

export default App;