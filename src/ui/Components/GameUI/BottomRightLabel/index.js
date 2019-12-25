import React, { Component } from 'react';

class App extends Component {
    render() {
        const {
            level,
            experience,
            levelExperience,
            unspentTalents,
        } = this.props;

        return (
            <div className="label--in-game bottom-right">
                Exp: {Math.floor(experience)} / {Math.floor(levelExperience)}
                &nbsp;| Talents: {unspentTalents}
                &nbsp;| Level: {level}
            </div>
        );
    }
}

export default App;