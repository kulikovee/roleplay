import React from 'react';
import ReactDOM from 'react-dom';
import App from './ui/App.js';
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import './style.scss';

window.THREE = THREE;
window.GLTFLoader = GLTFLoader;

ReactDOM.render(<App />, document.getElementById('ui'));