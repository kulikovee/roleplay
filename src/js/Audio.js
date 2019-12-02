import * as THREE from 'three';
import AutoBindMethods from './AutoBindMethods';

export default class Audio extends AutoBindMethods {
    constructor(scene) {
        super();
        this.scene = scene;
        this.listener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();
        this.scene.camera.camera.add(this.listener);
    }

    playMusic(name) {
        this.audioLoader.load(`./assets/audio/musics/${name}.ogg`, (buffer) => {
            const sound = new THREE.Audio(this.listener);
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.1);
            sound.play();
        });
    }

    playSound(position, name) {
        this.audioLoader.load(`./assets/audio/sounds/${name}.ogg`, (buffer) => {
            const sound = new THREE.PositionalAudio(this.listener);
            sound.position.copy(position);
            sound.setBuffer(buffer);
            sound.setLoop(false);
            sound.setVolume(0.5);
            sound.play();
        });
    }
}