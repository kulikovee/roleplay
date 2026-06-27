import React from 'react';
import Button from '../Common/Button';

export default ({
    onStartGame,
    userName,
    onUserNameChange,
    password,
    onPasswordChange,
}) => (
    <div className="overlay theme">
        <div className="menu">
            <div className="row">
                <label>Unnamed Eduard's Roleplay</label>
            </div>

            <div className="row">
                <label className="login-label">Username</label>
                <input className="login-input" value={userName} onChange={onUserNameChange}/>
            </div>

            <div className="row">
                <label className="login-label">Password</label>
                <input className="login-input" type="password" value={password} onChange={onPasswordChange}/>
            </div>
            <div className="row">
                <div>
                    <Button value="Join to the server" onClick={onStartGame} />
                </div>
            </div>
        </div>
    </div>
);