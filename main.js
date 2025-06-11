// Import Three.js core and necessary modules for post-processing and controls
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

//Scene, camera, renderer setup
let scene = new THREE.Scene();
let camera, renderer, controls, sun;
const canvas = document.querySelector("canvas");

// Perspective camera
camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(50, 35, 15);
camera.lookAt(0, 0, 0);
scene.position.y = 25;

// Move camera slightly forward
const direction = new THREE.Vector3();
camera.getWorldDirection(direction);
camera.position.addScaledVector(direction, 15);
scene.add(camera);

// Renderer setup
renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setClearColor(0x000000, 0.0); // Transparent background

// Bloom (glow) post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // intensity
  0.4, // radius
  0.85 // threshold
);
bloomPass.threshold = 0;
bloomPass.strength = 2; // bloom strength
bloomPass.radius = 0;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Used to temporarily darken non-bloomed objects
const darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const materials = {};

function darkenNonBloomed(obj) {
  if (obj.isMesh && !obj.layers.test(camera.layers)) {
    materials[obj.uuid] = obj.material;
    obj.material = darkMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

// Sun setup
const sunColor = new THREE.Color("#FDB813");
const sunGeo = new THREE.IcosahedronGeometry(1, 20);
const loader = new THREE.TextureLoader();

loader.load("textures/sun.jpg", texture => {
  const sunMat = new THREE.MeshBasicMaterial({ map: texture, color: sunColor });
  sun = new THREE.Mesh(sunGeo, sunMat);
  sun.position.set(0, 0, 0);
  sun.layers.set(1); // Only render to bloom layer
  scene.add(sun);
});

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.1));
scene.add(new THREE.PointLight(0xffffff, 40, 1000));

// Planet data configuration
const planetData = [
  { name: "Mercury", size: 0.3, distance: 4, speed: 0.1, url: "mercury.jpg", rotationSpeed: 0.005 },
  { name: "Venus", size: 0.6, distance: 6, speed: 0.05, url: "venus.jpg", rotationSpeed: -0.001 },
  { name: "Earth", size: 0.7, distance: 8, speed: 0.03, url: "earth.jpg", rotationSpeed: 0.03 },
  { name: "Mars", size: 0.5, distance: 10, speed: 0.025, url: "mars.jpg", rotationSpeed: 0.028 },
  { name: "Jupiter", size: 1, distance: 14, speed: 0.015, url: "jupiter.jpg", rotationSpeed: 0.05 },
  { name: "Saturn", size: 0.75, distance: 18, speed: 0.01, url: "saturn.jpg", rotationSpeed: 0.045 },
  { name: "Uranus", size: 0.7, distance: 22, speed: 0.008, url: "uranus.jpg", rotationSpeed: -0.03 },
  { name: "Neptune", size: 0.65, distance: 26, speed: 0.006, url: "neptune.jpg", rotationSpeed: 0.035 }
];

const planets = [];
const controlsDiv = document.getElementById("controls");

// Add planets, orbits, rings, and speed sliders
planetData.forEach(data => {
  // Orbit ellipse
  const curve = new THREE.EllipseCurve(0, 0, data.distance, data.distance * 0.7, 0, 2 * Math.PI);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbit = new THREE.LineLoop(geometry, new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
  }));
  orbit.rotation.x = Math.PI / 2;
  scene.add(orbit);

  // Load planet texture
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  loader.load(`textures/${data.url}`, texture => {
    const mat = new THREE.MeshStandardMaterial({ map: texture });
    const mesh = new THREE.Mesh(geo, mat);

    // Create planet group for orbiting
    const group = new THREE.Group();
    mesh.position.set(0, 0, 0);
    group.add(mesh);
    scene.add(group);

    // Store properties
    data.angle = 0;
    data.mesh = mesh;
    data.group = group;
    planets.push(data);

    // Add rings for Saturn & Uranus
    if (data.name === "Saturn" || data.name === "Uranus") {
      loader.load(`textures/${data.name.toLowerCase()}_ring.png`, ringTexture => {
        const inner = data.size * 1.2;
        const outer = data.size * 2.2;
        const segments = 128;

        const ringGeo = new THREE.RingGeometry(inner, outer, segments);

        // Fix UVs for circular mapping
        const pos = ringGeo.attributes.position;
        const uv = [];
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i);
          const radius = Math.sqrt(x * x + y * y);
          const angle = Math.atan2(y, x);
          uv.push((angle + Math.PI) / (2 * Math.PI), (radius - inner) / (outer - inner));
        }
        ringGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));

        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true
        });

        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.rotation.z = Math.PI / 5;
        group.add(ringMesh);
      });
    }
  });

  // Add speed control slider
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = data.name;
  const input = document.createElement("input");
  input.type = "range";
  input.min = 0.001;
  input.max = 0.1;
  input.step = 0.001;
  input.value = data.speed;

  input.addEventListener("input", e => {
    data.speed = parseFloat(e.target.value);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  controlsDiv.appendChild(wrapper);
});

// Orbit controls
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});

// Zoom on scroll
window.addEventListener("wheel", event => {
  camera.position.z += event.deltaY * 0.01;
});

// Pause/Resume button
let paused = false;
document.getElementById("pauseResume").addEventListener("click", () => {
  paused = !paused;
  document.getElementById("pauseResume").textContent = paused ? "Resume" : "Pause";
});

// Animation and rendering
const clock = new THREE.Clock();

function renderBloom() {
  scene.traverse(darkenNonBloomed);
  camera.layers.set(1); // render only bloom layer
  bloomComposer.render();
  scene.traverse(restoreMaterial);
  camera.layers.set(0); // restore original
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  controls.update();

  if (!paused) {
    planets.forEach(p => {
      p.angle += p.speed * delta;
      const x = Math.cos(p.angle) * p.distance;
      const z = Math.sin(p.angle) * p.distance * 0.7;
      p.group.position.set(x, 0, z);
      p.mesh.rotation.y += p.rotationSpeed;
    });
    if (sun) sun.rotation.y += 0.001;
  }

  renderBloom(); // glow layer first
  camera.layers.enableAll(); // enable full render
  renderer.clearDepth();
  renderer.render(scene, camera); // normal render
}

animate();