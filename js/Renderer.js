export default class Renderer {
    constructor(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xccccff);
        container.appendChild(this.renderer.domElement);

        this.setSize = this.setSize.bind(this);
        this.render = this.render.bind(this);
        this.requestPointerLock = this.requestPointerLock.bind(this);
        this.addPointerLockEvents = this.addPointerLockEvents.bind(this);

        this.addPointerLockEvents(blocker, instructions);
    }

    setSize(width, height) {
        this.renderer.setSize(width, height);
    }

    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    requestPointerLock() {
        const element = document.body;

        if (
            "pointerLockElement" in document ||
            "mozRequestPointerLock" in document ||
            "webkitRequestPointerLock" in document
        ) {
            element.requestPointerLock =
                element.requestPointerLock ||
                element.mozRequestPointerLock ||
                element.webkitRequestPointerLock;

            if (element.requestPointerLock) {
                element.requestPointerLock();
            }
        }
    }

    exitPointerLock() {
        const element = document;

        if (
            "pointerLockElement" in document ||
            "mozRequestPointerLock" in document ||
            "webkitRequestPointerLock" in document
        ) {
            element.exitPointerLock =
                element.exitPointerLock ||
                element.mozExitPointerLock ||
                element.webkitExitPointerLock;

            if (element.exitPointerLock) {
                element.exitPointerLock();
            }
        }
    }

    addPointerLockEvents(blocker, instructions) {
        const element = document.body;

        if (
            "pointerLockElement" in document ||
            "mozRequestPointerLock" in document ||
            "webkitRequestPointerLock" in document
        ) {
            const pointerlockchange = function (event) {
                if (
                    document.pointerLockElement === element ||
                    document.mozPointerLockElement === element ||
                    document.webkitPointerLockElement === element
                ) {
                    blocker.style.display = "none";
                } else {
                    blocker.style.display = "-webkit-box";
                    blocker.style.display = "-moz-box";
                    blocker.style.display = "box";

                    instructions.style.display = "";
                }
            };

            const pointerlockerror = function (event) {
                instructions.style.display = "";
            };

            document.addEventListener("pointerlockchange", pointerlockchange, false);
            document.addEventListener(
                "mozpointerlockchange",
                pointerlockchange,
                false
            );
            document.addEventListener(
                "webkitpointerlockchange",
                pointerlockchange,
                false
            );
        } else {
            instructions.innerHTML +=
                "Your browser doesn't seem to support Pointer Lock API<br>";
        }

        if (
            "fullscreenElement" in document ||
            "mozRequestFullScreenElement" in document ||
            "webkitFullscreenElement" in document
        ) {
            blocker.addEventListener(
                "click",
                function () {
                    document.addEventListener(
                        "fullscreenchange",
                        fullscreenchange,
                        false
                    );
                    document.addEventListener(
                        "mozfullscreenchange",
                        fullscreenchange,
                        false
                    );
                    document.addEventListener(
                        "webkitfullscreenchange",
                        fullscreenchange,
                        false
                    );

                    element.requestFullscreen =
                        element.requestFullscreen ||
                        element.webkitRequestFullscreen ||
                        element.mozRequestFullScreen;

                    element.requestFullscreen();
                },
                false
            );

            const fullscreenchange = function (event) {
                if (
                    document.fullscreenElement === element ||
                    document.mozFullScreenElement === element ||
                    document.webkitFullscreenElement === element
                ) {
                    document.removeEventListener("fullscreenchange", fullscreenchange);
                }
            };
        } else {
            instructions.innerHTML +=
                "Your browser doesn't seem to support Fullscreen API<br>";
        }
    }
}
