import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
const canvas = document.querySelector("canvas");

scene = new THREE.Scene();
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 1000;

camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 20; // Adjusted for better visibility
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
bloomPass.strength = 1; // Reduced bloom strength
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Sun
const sunColor = new THREE.Color("#FDB813");
const sunGeo = new THREE.IcosahedronGeometry(1.5, 15); // Increased size for better visibility
const sunMat = new THREE.MeshStandardMaterial({ color: sunColor });
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.position.set(0, 0, 0);
scene.add(sun);

// Increased intensity of the sun's light
const sunLight = new THREE.PointLight(0xffffff, 5, 100); // Increased intensity from 2 to 5
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// Planet data with increased speeds
const planetData = [
  { name: 'Mercury', size: 0.2, distance: 4, speed: 0.1, url: "mercury.jpg" }, // Increased speed
  { name: 'Venus', size: 0.3, distance: 6, speed: 0.05, url: "venus_atmosphere.jpg" }, // Increased speed
  { name: 'Earth', size: 0.3, distance: 8, speed: 0.03, url: "earth.jpg" }, // Increased speed
  { name: 'Mars', size: 0.25, distance: 10, speed: 0.025, url: "mars.jpg" }, // Increased speed
  { name: 'Jupiter', size: 0.5, distance: 14, speed: 0.015, url: "jupiter.jpg" }, // Increased speed
  { name: 'Saturn', size: 0.4, distance: 18, speed: 0.01, url: "saturn.jpg" }, // Increased speed
  { name: 'Uranus', size: 0.35, distance: 22, speed: 0.008, url: "uranus.jpg" }, // Increased speed
  { name: 'Neptune', size: 0.35, distance: 26, speed: 0.006, url: "neptune.jpg" } // Increased speed
];

const planets = [];
planetData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const loader = new THREE.TextureLoader();
  loader.load(`textures/${data.url}`, (texture) => {
    const mat = new THREE.MeshStandardMaterial({ map: texture, emissive: 0x000000 }); // No self-illumination
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x = data.distance;
    scene.add(mesh);
    data.angle = 0;
    data.mesh = mesh;
    planets.push(data);
  }, undefined, (err) => {
    console.error(`Failed to load texture for ${data.name}`, err);
  });
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Reduced ambient light
scene.add(ambientLight);

// Controls
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.enableZoom = true; // Allow zooming with scroll

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll to adjust camera distance
window.addEventListener('wheel', (event) => {
  camera.position.z += event.deltaY * 0.01; // Adjust zoom speed
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta(); // seconds.
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  planets.forEach(p => {
    p.angle += p.speed * delta; // Adjust speed based on time
    p.mesh.position.x = Math.cos(p.angle) * p.distance;
    p.mesh.position.z = Math.sin(p.angle) * p.distance;
  });
  bloomComposer.render();
}

animate();
