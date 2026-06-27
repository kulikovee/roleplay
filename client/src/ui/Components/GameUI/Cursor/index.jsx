import React, { useState, useEffect } from 'react';

export default ({ setUpdate }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setUpdate((x, y) => setPosition({ x, y }));
    }, [setUpdate]);

    return (
        <div
            className="cursor"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        ></div>
    );
};
