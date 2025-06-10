import * as THREE from 'https://unpkg.com/three@0.148.0/build/three.module.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('solarSystem') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const light = new THREE.PointLight(0xffffff, 2, 1000);
scene.add(light);

// Sun
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFDB813 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planet data
const planetData = [
  { name: 'Mercury', size: 0.3, distance: 4, speed: 0.04, color: 0xaaaaaa },
  { name: 'Venus', size: 0.5, distance: 6, speed: 0.015, color: 0xffcc99 },
  { name: 'Earth', size: 0.5, distance: 8, speed: 0.01, color: 0x3399ff },
  { name: 'Mars', size: 0.4, distance: 10, speed: 0.008, color: 0xff3300 },
  { name: 'Jupiter', size: 1, distance: 14, speed: 0.006, color: 0xff9966 },
  { name: 'Saturn', size: 0.9, distance: 18, speed: 0.005, color: 0xffff99 },
  { name: 'Uranus', size: 0.7, distance: 22, speed: 0.003, color: 0x66ffff },
  { name: 'Neptune', size: 0.7, distance: 26, speed: 0.002, color: 0x6666ff }
];

const planets = [];
planetData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ color: data.color });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  mesh.position.x = data.distance;
  data.angle = 0;
  data.mesh = mesh;
  planets.push(data);

  // Speed controls
  const label = document.createElement('label');
  label.textContent = `${data.name}`;
  label.style.display = 'block';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = 0.001;
  input.max = 0.1;
  input.step = 0.001;
  input.value = data.speed;
  input.addEventListener('input', (e) => {
    data.speed = parseFloat(e.target.value);
  });
  document.getElementById('controls').appendChild(label);
  document.getElementById('controls').appendChild(input);
});

camera.position.z = 40;

let paused = false;

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  if (!paused) {
    planets.forEach(p => {
      p.angle += p.speed;
      p.mesh.position.x = Math.cos(p.angle) * p.distance;
      p.mesh.position.z = Math.sin(p.angle) * p.distance;
    });
  }
  renderer.render(scene, camera);
}
animate();

document.getElementById('pauseResume').addEventListener('click', () => {
  paused = !paused;
  document.getElementById('pauseResume').textContent = paused ? 'Resume' : 'Pause';
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});