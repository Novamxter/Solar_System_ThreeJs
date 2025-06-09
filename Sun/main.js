import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";

let scene, camera, renderer;
const canvas = document.querySelector("canvas");

scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 8;
scene.add(camera);

renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000, 0.0);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0;
bloomPass.strength = 2;
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Sun
const sunColor = new THREE.Color("#FDB813");
const sunGeo = new THREE.IcosahedronGeometry(1, 15);
const sunMat = new THREE.MeshBasicMaterial({ color: sunColor });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(0, 0, 0);
sun.layers.set(1);
scene.add(sun);

// Galaxy background
const galaxyGeo = new THREE.SphereGeometry(80, 64, 64);
const galaxyTex = new THREE.TextureLoader().load("texture/galaxy1.png");
const galaxyMat = new THREE.MeshBasicMaterial({
  map: galaxyTex,
  side: THREE.BackSide,
  transparent: true
});
const galaxy = new THREE.Mesh(galaxyGeo, galaxyMat);
galaxy.layers.set(1);
scene.add(galaxy);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  galaxy.rotation.y += 0.001;
  camera.layers.set(1);
  bloomComposer.render();
}

animate();
