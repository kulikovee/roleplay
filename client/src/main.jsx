import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App.jsx';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.scss';

window.THREE = THREE;
window.GLTFLoader = GLTFLoader;

createRoot(document.getElementById('ui')).render(<App />);
