import React from 'react';
import Button from '../Common/Button';

export default ({
    onStartGame
}) => (
    <div className="overlay theme">
        <div className="menu">
            <div className="row">
                <label>Unnamed Eduard's Roleplay</label>
            </div>
            <div className="row">
                <div>
                    <Button value="Join the Game" onClick={onStartGame} />
                </div>
            </div>
        </div>
    </div>
);