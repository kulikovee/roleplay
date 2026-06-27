import React from 'react';

export default ({ hp, hpMax, speed, damage, fireDamage }) => (
    <div className="label--in-game bottom-left">
        HP {Math.ceil(hp)} / {Math.ceil(hpMax)}<br />
        Movement Speed: {Math.floor(speed * 100)}%<br />
        Melee Damage: {damage}<br />
        Ranged Damage: {fireDamage}
    </div>
);
