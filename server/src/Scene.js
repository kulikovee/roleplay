import * as THREE from 'three';
import Renderer from '../../client/src/js/Renderer';
import Scene from '../../client/src/js/Scene';

exports.initScene = (rendererParams, MockGUI) => {
   debug('Starting server scene initialization ...');

   const scene = new Scene(new Renderer(null, rendererParams), MockGUI, true);

   scene.particles.update = () => {};
   scene.particles.createSnow = () => ({});
   scene.particles.createEffect = () => ({});
   scene.particles.loadEffect = () => ({});
   scene.particles.createAttachedParticles = () => ({});
   scene.particles.getRandomPosition = () => {};
   scene.particles.createInstantParticles = () => ({});
   scene.particles.destroy = () => {};

   // scene.models.createGeometry = () => new THREE.Object3D();

   scene.camera.update = () => ({});
   scene.camera.addY = () => ({});
   scene.camera.getWidth = () => 1;
   scene.camera.getHeight = () => 1;
   scene.camera.updateThirdPerson = () => ({});
   scene.camera.toScreenPosition = () => ({});

   return scene;
};
