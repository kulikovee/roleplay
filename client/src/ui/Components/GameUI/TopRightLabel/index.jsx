import React from 'react';

const getFormattedValue = value => `${value >= 0 ? '+' : ''}${(Math.round(value * 100) / 100).toFixed(2)}`;

export default ({ position, rotation, money, fps, targetFps, ping }) => (
    <div className="label--in-game top-right">
        ${Math.floor(money)}<br />
        Position: {position && [position.x, position.y, position.z].map(getFormattedValue).join(', ')}<br />
        Rotation: {rotation && getFormattedValue(rotation.y)}<br />
        FPS: {Math.round(fps)} (Target: {Math.round(targetFps)})<br />
        Ping: {ping}ms
    </div>
);
