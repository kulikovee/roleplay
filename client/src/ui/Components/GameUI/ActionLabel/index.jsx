import React from 'react';

export default ({ action, isVisible }) => (
    <div className={`notification label--in-game h2 monospace top-center ${isVisible ? 'visible' : 'hidden'}`}>
        {action}
    </div>
);
