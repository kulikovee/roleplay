import * as THREE from 'three'
import Renderer from './js/Renderer';
import Scene from './js/Scene';
import './style.scss';

window.addEventListener('load', function () {
    THREE.Cache.enabled = true;

    const container = document.getElementById('container'),
        renderer = new Renderer(container),
        scene = new Scene(renderer),
        onResize = () => {
            scene.camera.camera.aspect = container.clientWidth / container.clientHeight;
            scene.camera.camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        },
        requestPointerLock = () => !scene.ui.pause && scene.ui.requestPointerLock();

    window.addEventListener('resize', onResize, false);
    document.body.addEventListener('click', requestPointerLock, false);
});