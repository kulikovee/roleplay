import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <div id="action">{this.props.action}</div>
        );
    }
}

export default App;