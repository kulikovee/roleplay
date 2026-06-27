import React from 'react';

export default ({ level, experience, levelExperience, unspentTalents }) => (
    <div className="label--in-game bottom-right">
        Exp: {Math.floor(experience)} / {Math.floor(levelExperience)}
        &nbsp;| Talents: {unspentTalents}
        &nbsp;| Level: {level}
    </div>
);
