import Renderer from "../../client/src/js/Renderer";
import Scene from '../../client/src/js/Scene';

exports.initScene = (rendererParams, MockGUI) => {
   debug('Starting server scene initialization ...');

   const scene = new Scene(new Renderer(null, rendererParams), MockGUI);

   const renderer = scene.renderer.renderer;
   const render = renderer.render;
   setTimeout(() => render.call(renderer, scene.scene, scene.camera.camera), 3000);
   renderer.render = () => null;

   scene.particles.update = () => {};
   scene.particles.createSnow = () => ({});
   scene.particles.createEffect = () => ({});
   scene.particles.loadEffect = () => ({});
   scene.particles.createAttachedParticles = () => ({});
   scene.particles.getRandomPosition = () => {};
   scene.particles.createInstantParticles = () => ({});
   scene.particles.destroy = () => {};

   return scene;
};
