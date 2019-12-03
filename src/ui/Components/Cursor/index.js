import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <div
                id="cursor"
                style={{
                    left: `${this.props.left}px`,
                    top: `${this.props.top}px`,
                }}
            ></div>
        );
    }
}

export default App;