import React, { Component } from 'react';
import GameUI from './Components/GameUI';
import SplashScreen from './Components/SplashScreen';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSplashScreen: true,
        };
    }

    render () {
        const { isSplashScreen } = this.state;

        return (
            isSplashScreen
                ? <SplashScreen onStartGame={() => this.setState({ isSplashScreen: false })}/>
                : <GameUI />
        );
    }
}

export default App;