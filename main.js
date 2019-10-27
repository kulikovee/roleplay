import Renderer from './js/Renderer.js';
import Scene from './js/Scene.js';
import DemoLevel from './js/DemoLevel.js';

window.addEventListener("load", function () {
    const container = document.getElementById("container"),
        blocker = document.getElementById("blocker"),
        instructions = document.getElementById("instructions"),
        renderer = new Renderer(container, blocker, instructions),
        scene = new Scene(renderer),
        level = new DemoLevel(scene),
        onResize = () => {
            scene.camera.aspect = container.clientWidth / container.clientHeight;
            scene.camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        },
        requestPointerLock = () => !scene.ui.pause && renderer.requestPointerLock();

    scene.setLevel(level);
    level.startLevel();

    window.addEventListener("resize", onResize, false);
    document.body.addEventListener("click", requestPointerLock, false);
});
