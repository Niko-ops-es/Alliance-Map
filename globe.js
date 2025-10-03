import * as THREE from '../three.module.js';
import { OrbitControls } from '../OrbitControls.js';
fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhtTfAIfi6Y7XGZc9oakLIsEdZrStanKxYJFbfKm9auOUmf_UlM0kDns-xFg6_ZVYCcfIfod90HCFXt2J6zAXwug3dKiu16wXhqNWicKaf21dCsTNxag5qKvF9JEYmU7Tx5Bt7lWyL3HpN1HiOF--xeYWr9EEBE5-PlKQ46KWSvhXggDJo3pL5utY8ewXYAUHtTGwlbUomWw8EWsRg3DYWdrq5itLnc5J9SOXkYTOw7L8wm-jfQZu9dsooXMRPo9Joi1QKK97e31IjTgSo87QgnJtx36Q&lib=MeuHukb0_QFFTkTu7ZmNGZ-bz0hb3lOss')
  .then(res => res.json())
  .then(data => initGlobe(data));

function initGlobe(players) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const texture = new THREE.TextureLoader().load('earth.jpg');
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  scene.add(globe);

  const colorMap = {
    'UTC-8': 0x00ffff,
    'UTC-5': 0x00ff00,
    'UTC-3': 0xffff00,
    'UTC+1': 0xffa500,
    'UTC+3': 0xff69b4,
    'UTC+8': 0xff0000,
    'Desconocido': 0xffffff
  };

  const points = [];

  players.forEach(player => {
    const { lat, lng, nickname, utc } = player;
    if (lat === 0 && lng === 0) return;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const radius = 5.1;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const color = colorMap[utc] || 0xffffff;

    const point = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    point.position.set(x, y, z);
    point.userData = { nickname };
    globe.add(point);
    points.push(point);
  });

  camera.position.z = 10;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enableRotate = true;
controls.minDistance = 6;
controls.maxDistance = 20;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const tooltip = document.createElement('div');
  tooltip.style.position = 'absolute';
  tooltip.style.padding = '6px 10px';
  tooltip.style.background = 'rgba(0,0,0,0.7)';
  tooltip.style.color = '#fff';
  tooltip.style.borderRadius = '4px';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.fontFamily = 'Arial';
  tooltip.style.fontSize = '14px';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(points);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      tooltip.textContent = intersected.userData.nickname;
      tooltip.style.left = event.clientX + 10 + 'px';
      tooltip.style.top = event.clientY + 10 + 'px';
      tooltip.style.display = 'block';
    } else {
      tooltip.style.display = 'none';
    }
  });
function updateUTCClock() {
  const now = new Date();
  const utcTime = now.toUTCString().slice(17, 25); // HH:MM:SS
  document.getElementById('utcClock').textContent = `UTC: ${utcTime}`;
}
setInterval(updateUTCClock, 1000);
  function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Actualiza la cámara según el mouse
  globe.rotation.y += 0.001;
  renderer.render(scene, camera);
}

  animate();
}