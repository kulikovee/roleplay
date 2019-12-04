import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <div
                id="cursor"
                style={{
                    left: `${this.props.x}px`,
                    top: `${this.props.y}px`,
                }}
            ></div>
        );
    }
}

export default App;