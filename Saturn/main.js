import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
//import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // space background

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights
const light = new THREE.PointLight(0xffffff, 1.2);
light.position.set(10, 10, 10);
scene.add(light);

// Create Saturn
const saturnTexture = new THREE.TextureLoader().load('../textures/saturn.jpg');
const saturnGeo = new THREE.SphereGeometry(3, 64, 64);
const saturnMat = new THREE.MeshStandardMaterial({ map: saturnTexture });
const saturn = new THREE.Mesh(saturnGeo, saturnMat);
scene.add(saturn);

// Create Rings (transparent PNG texture works well)
const ringTexture = new THREE.TextureLoader().load('../textures/saturn_ring.png');
const ringGeo = new THREE.RingGeometry(3.5, 6, 64);
const ringMat = new THREE.MeshBasicMaterial({
  map: ringTexture,
  side: THREE.DoubleSide,
  transparent: true
});
const rings = new THREE.Mesh(ringGeo, ringMat);
rings.rotation.x = Math.PI / 2;
rings.rotation.z = Math.PI / 5;
scene.add(rings);

// Controls for rotation via mouse
const controls = new OrbitControls(camera, renderer.domElement);

// Responsive canvas
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate Saturn and ring slowly
  saturn.rotation.y += 0.002;
  rings.rotation.z += 0.001;

  controls.update();
  renderer.render(scene, camera);
}
animate();