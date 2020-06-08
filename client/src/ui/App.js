import React, { Component } from 'react';
import GameUI from './Components/GameUI';
import SplashScreen from './Components/SplashScreen';

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isSplashScreen: true,
			userName: '',
			password: '',
		};
	}

	render() {
		const { isSplashScreen, userName, password } = this.state;

		return (
			isSplashScreen
				? <SplashScreen
					userName={userName}
					password={password}
               onUserNameChange={e => this.setState({ userName: e.target.value })}
               onPasswordChange={e => this.setState({ password: e.target.value })}
					onStartGame={() => this.setState({ isSplashScreen: !userName || !password })}
				/>
				: <GameUI userName={userName} password={password} />
		);
	}
}

export default App;