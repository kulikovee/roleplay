export const requestPointerLock = () => {
    const element = document.body;

    if (
        'pointerLockElement' in document ||
        'mozRequestPointerLock' in document ||
        'webkitRequestPointerLock' in document
    ) {
        element.requestPointerLock =
            element.requestPointerLock ||
            element.mozRequestPointerLock ||
            element.webkitRequestPointerLock;

        if (element.requestPointerLock) {
            element.requestPointerLock();
        }
    }
};

export const exitPointerLock = () => {
    const element = document;

    if (
        'pointerLockElement' in document ||
        'mozRequestPointerLock' in document ||
        'webkitRequestPointerLock' in document
    ) {
        element.exitPointerLock =
            element.exitPointerLock ||
            element.mozExitPointerLock ||
            element.webkitExitPointerLock;

        if (element.exitPointerLock) {
            element.exitPointerLock();
        }
    }
};

export const onPointerLockChange = (callback) => {
    window.setTimeout(() => {
        const isPointerLocked = (
            document.pointerLockElement === document.body
            || document.mozPointerLockElement === document.body
            || document.webkitPointerLockElement === document.body
        );

        callback && callback(isPointerLocked);
    }, 100);
};

export const onFullscreenChange = (event) => {
    if (
        document.fullscreenElement === document.body
        || document.mozFullScreenElement === document.body
        || document.webkitFullscreenElement === document.body
    ) {
        document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    }
};

export const addPointerLockEvents = (fullscreenButton) => {
    if (
        'pointerLockElement' in document
        || 'onpointerlockchange' in document
        || 'mozRequestPointerLock' in document
        || 'webkitRequestPointerLock' in document
    ) {
        document.addEventListener('pointerlockchange', this.onPointerLockChange, false);
        document.addEventListener('mozpointerlockchange', this.onPointerLockChange, false );
        document.addEventListener('webkitpointerlockchange', this.onPointerLockChange, false );
    } else {
        throw 'Your browser doesn\'t seem to support Pointer Lock API';
    }

    if (
        'fullscreenElement' in document
        || 'mozRequestFullScreenElement' in document
        || 'webkitFullscreenElement' in document
    ) {
        fullscreenButton.addEventListener(
            'click',
            () => {
                document.addEventListener('fullscreenchange', this.onFullscreenChange, false);
                document.addEventListener('mozfullscreenchange', this.onFullscreenChange, false);
                document.addEventListener('webkitfullscreenchange', this.onFullscreenChange, false);

                document.body.requestFullscreen =
                    document.body.requestFullscreen ||
                    document.body.webkitRequestFullscreen ||
                    document.body.mozRequestFullScreen;

                document.body.requestFullscreen();
            },
            false
        );
    } else {
        throw 'Your browser doesn\'t seem to support Fullscreen API';
    }
};