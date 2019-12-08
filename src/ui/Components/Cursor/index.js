import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.state = { x: 0, y: 0 };
    }

    update() {
        this.setState({
            x: this.props.scene.input.cursor.x,
            y: this.props.scene.input.cursor.y,
        });
    }

    render() {
        return (
            <div
                id="cursor"
                style={{
                    left: `${this.state.x}px`,
                    top: `${this.state.y}px`,
                }}
            ></div>
        );
    }
}

export default App;