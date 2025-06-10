import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, 20);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ✅ Add Ambient Light (base light)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased intensity
scene.add(ambientLight);

// ✅ Add Strong Point Light
const pointLight = new THREE.PointLight(0xffffff, 3); // Increased intensity
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Saturn planet
const saturnGeo = new THREE.SphereGeometry(3, 64, 64);
const saturnMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,      // full color brightness
  roughness: 0.1,       // less matte for better reflection
  metalness: 0.5       // increased metallic shine
}); // Safe base
const saturn = new THREE.Mesh(saturnGeo, saturnMat);
scene.add(saturn);

// ✅ Load Saturn texture
new THREE.TextureLoader().load(
  '../textures/saturn.jpg',
  (texture) => {
    saturnMat.map = texture;
    saturnMat.needsUpdate = true;
    console.log("✅ Saturn texture applied.");
  },
  undefined,
  (err) => {
    console.error("❌ Failed to load Saturn texture:", err);
  }
);

// Rings with transparent texture
const ringGeo = new THREE.RingGeometry(3.5, 6, 64);
const ringMat = new THREE.MeshStandardMaterial({
  map: new THREE.TextureLoader().load('../textures/saturn_ring.png'),
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8 // Adjust opacity for better visibility
});
const rings = new THREE.Mesh(ringGeo, ringMat);
rings.rotation.x = Math.PI / 2;
rings.rotation.z = Math.PI / 5;
rings.position.y = 0.01; // avoid z-fighting
scene.add(rings);


// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  saturn.rotation.y += 0.002;
  rings.rotation.z += 0.001;

  controls.update();
  renderer.render(scene, camera);
}
animate();
