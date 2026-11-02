import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// =====================================================
// visual+ CODE_001 — DEEP SPACE / CINEMA EDITION
// Preview + 1440p Cinema Render
// =====================================================

const CONFIG = {
  speed: 7,
  planets: 34,
  stars: 16000,
  dust: 5000,
  cinemaWidth: 2560,
  cinemaHeight: 1440,
  fps: 60,
  videoBitrate: 28000000,
  audioBitrate: 320000
};

// =====================================================
// SCENE
// =====================================================

document.body.innerHTML = '';
document.body.style.cssText = `
  margin:0;
  overflow:hidden;
  background:#020308;
  width:100%;
  height:100%;
`;
document.documentElement.style.cssText = 'width:100%;height:100%;overflow:hidden;';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020308);
scene.fog = new THREE.FogExp2(0x03050b, 0.0007);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1800
);
camera.position.set(0, 0, 25);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

renderer.domElement.style.cssText = `
  display:block;
  width:100vw;
  height:100dvh;
`;

document.body.appendChild(renderer.domElement);

// =====================================================
// POST PROCESSING / BLOOM
// =====================================================

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.85,
  0.65,
  0.22
);

composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// =====================================================
// LIGHTING
// =====================================================

scene.add(new THREE.AmbientLight(0x8290b8, 0.65));

const mainLight = new THREE.PointLight(0x9bbcff, 180, 650);
mainLight.position.set(-35, 25, -100);
scene.add(mainLight);

const redLight = new THREE.PointLight(0x9b244c, 90, 400);
redLight.position.set(45, -20, -230);
scene.add(redLight);

// =====================================================
// USER INTERFACE
// =====================================================

const style = document.createElement('style');
style.textContent = `
  #vp-panel {
    position:fixed; z-index:1000; top:20px; left:20px; width:300px;
    max-height:calc(100dvh - 40px); overflow-y:auto; padding:16px;
    box-sizing:border-box; color:#e8edf7; background:rgba(5,8,17,.9);
    border:1px solid rgba(160,190,255,.3); backdrop-filter:blur(14px);
    box-shadow:0 0 35px rgba(40,90,180,.14); font-family:Arial,sans-serif;
    transition:opacity .22s ease, transform .22s ease;
  }
  #vp-panel * { box-sizing:border-box; }
  #vp-panel .brand { font-size:20px; letter-spacing:6px; font-weight:700; margin-bottom:4px; }
  #vp-panel .sub { color:#8291aa; font-size:9px; letter-spacing:3px; margin-bottom:13px; }
  #vp-panel button, #vp-panel label.file {
    background:#111a2b; border:1px solid #40516e; color:#eaf0ff;
    padding:11px 12px; cursor:pointer; font-size:10px; letter-spacing:1.2px;
    transition:.2s; touch-action:manipulation;
  }
  #vp-panel button:hover, #vp-panel label.file:hover { background:#243650; border-color:#9abaff; }
  #vp-panel button:active { transform:scale(.98); }
  #vp-panel .buttons { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin:10px 0; }
  #vp-panel .mode-buttons { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:8px 0 12px; }
  #vp-panel button.wide { width:100%; margin-top:7px; }
  #vp-panel input[type=file] { display:none; }
  #vp-panel input[type=range] { width:100%; accent-color:#9abaff; }
  #vp-panel .line { height:1px; background:rgba(160,190,255,.2); margin:13px 0; }
  #vp-panel .small { color:#8291aa; font-size:9px; letter-spacing:1.5px; margin:10px 0 6px; }
  #vp-status { color:#9abaff; font-size:10px; line-height:1.5; min-height:28px; margin-top:10px; }
  #vp-time { display:flex; justify-content:space-between; color:#8190a8; font-size:9px; margin-top:3px; }
  #vp-panel .rec { border-color:#87485c; color:#ffb4c6; }
  #vp-panel .hint { color:#65738b; font-size:9px; line-height:1.5; margin-top:10px; }
  #vp-panel .mode { border-color:#718ab5; color:#bcd4ff; }
  #vp-panel button.selected { background:#263b59; border-color:#b7d0ff; color:#fff; }
  #vp-toggle {
    position:fixed; z-index:1002; top:14px; left:14px; width:44px; height:44px;
    display:none; border:1px solid rgba(160,190,255,.45); border-radius:2px;
    color:#eaf0ff; background:rgba(5,8,17,.82); font-size:20px;
    backdrop-filter:blur(12px); cursor:pointer;
  }
  #vp-panel.is-hidden { opacity:0; pointer-events:none; transform:translateX(-110%); }
  #vp-toggle.is-visible { display:block; }
  @media(max-width:600px) {
    #vp-panel { top:8px; left:8px; width:min(285px, calc(100vw - 16px));
      max-height:calc(100dvh - 16px); padding:12px; }
    #vp-panel .brand { font-size:18px; }
    #vp-panel button, #vp-panel label.file { min-height:40px; }
    #vp-toggle { top:10px; left:10px; width:46px; height:46px; }
  }
`;
document.head.appendChild(style);

const panel = document.createElement('div');
panel.id = 'vp-panel';
panel.innerHTML = `
  <div class="brand">visual+</div>
  <div class="sub">CODE_001 / DEEP SPACE</div>
  <button id="vp-hide" class="wide">HIDE UI −</button>
  <div class="small">AUDIO SOURCE</div>
  <div class="mode-buttons">
    <button id="vp-original" class="selected">VISUAL+ ORIGINAL</button>
    <button id="vp-custom">YOUR AUDIO</button>
  </div>
  <label class="file" style="display:block;text-align:center">
    LOAD WAV / MP3
    <input id="vp-file" type="file" accept="audio/wav,audio/mpeg,audio/mp3,audio/*">
  </label>
  <div class="buttons">
    <button id="vp-play">PLAY</button>
    <button id="vp-pause">PAUSE</button>
  </div>
  <div class="small">TRACK POSITION</div>
  <input id="vp-seek" type="range" min="0" max="100" value="0">
  <div id="vp-time"><span id="vp-current">00:00</span><span id="vp-duration">00:00</span></div>
  <div class="line"></div>
  <button id="vp-cinema" class="wide mode">CINEMA MODE / 1440P</button>
  <button id="vp-record" class="wide rec">● RECORD VIDEO</button>
  <button id="vp-stop" class="wide">STOP RECORDING</button>
  <button id="vp-save" class="wide">SAVE WEBM</button>
  <div id="vp-status">VISUAL+ ORIGINAL / READY</div>
  <div class="hint">The space animation starts automatically. Sound may require one tap due to browser autoplay rules.<br>Mobile: hide this panel for fullscreen view.</div>
`;
document.body.appendChild(panel);
const toggle = document.createElement('button');
toggle.id = 'vp-toggle';
toggle.type = 'button';
toggle.textContent = '+';
toggle.setAttribute('aria-label', 'Show controls');
document.body.appendChild(toggle);

const $ = id => document.getElementById(id);

toggle.addEventListener('click', () => {
  panel.classList.remove('is-hidden');
  toggle.classList.remove('is-visible');
});
function hidePanel() {
  panel.classList.add('is-hidden');
  toggle.classList.add('is-visible');
}
// Double-click/tap the panel header to hide controls; the + button restores them.
panel.querySelector('.brand').style.cursor = 'pointer';
panel.querySelector('.brand').title = 'Tap to hide controls';
panel.querySelector('.brand').addEventListener('click', hidePanel);
$('vp-hide').addEventListener('click', hidePanel);

function status(message) {
  $('vp-status').textContent = message;
}

function timeString(seconds) {
  if (!Number.isFinite(seconds)) return '00:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

// =====================================================
// AUDIO ENGINE
// =====================================================

const audio = new Audio();
audio.preload = 'auto';

let audioContext = null;
let analyser = null;
let audioSource = null;
let recordDestination = null;
let audioReady = false;
let audioURL = null;

let audioData = new Uint8Array(128);
let bass = 0;
let mid = 0;
let treble = 0;

function prepareAudio() {
  if (audioReady) return;

  audioContext = new (
    window.AudioContext || window.webkitAudioContext
  )();

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.82;

  recordDestination =
    audioContext.createMediaStreamDestination();

  audioSource =
    audioContext.createMediaElementSource(audio);

  audioSource.connect(analyser);
  analyser.connect(audioContext.destination);
  audioSource.connect(recordDestination);

  audioData = new Uint8Array(analyser.frequencyBinCount);

  audioReady = true;
}

const ORIGINAL_AUDIO = '/music.wav';
let audioMode = 'original';

audio.src = ORIGINAL_AUDIO;
audio.load();

function setAudioMode(mode) {
  audio.pause();
  audio.currentTime = 0;
  audioMode = mode;
  $('vp-seek').value = 0;
  $('vp-current').textContent = '00:00';
  $('vp-duration').textContent = '00:00';
  $('vp-original').classList.toggle('selected', mode === 'original');
  $('vp-custom').classList.toggle('selected', mode === 'custom');
  if (mode === 'original') {
    if (audioURL) { URL.revokeObjectURL(audioURL); audioURL = null; }
    audio.src = ORIGINAL_AUDIO;
    audio.load();
    status('VISUAL+ ORIGINAL / PRESS PLAY');
  } else {
    status('YOUR AUDIO / LOAD A WAV OR MP3');
  }
}

function loadAudioFile(file) {
  if (!file) return;
  if (!file.type.startsWith('audio/')) {
    status('UNSUPPORTED FILE / CHOOSE WAV OR MP3');
    return;
  }
  if (audioURL) URL.revokeObjectURL(audioURL);
  audio.pause();
  audioURL = URL.createObjectURL(file);
  audio.src = audioURL;
  audio.load();
  audioMode = 'custom';
  $('vp-original').classList.remove('selected');
  $('vp-custom').classList.add('selected');
  status('YOUR AUDIO LOADED / PRESS PLAY');
}

$('vp-original').addEventListener('click', () => setAudioMode('original'));
$('vp-custom').addEventListener('click', () => {
  audio.pause();
  audioMode = 'custom';
  $('vp-original').classList.remove('selected');
  $('vp-custom').classList.add('selected');
  status('YOUR AUDIO / CHOOSE WAV OR MP3');
  $('vp-file').click();
});
$('vp-file').addEventListener('change', event => {
  loadAudioFile(event.target.files[0]);
  event.target.value = '';
});

audio.addEventListener('loadedmetadata', () => {
  $('vp-duration').textContent = timeString(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || !Number.isFinite(audio.duration)) return;
  $('vp-seek').value = (audio.currentTime / audio.duration) * 100;
  $('vp-current').textContent = timeString(audio.currentTime);
});
audio.addEventListener('error', () => {
  if (audioMode === 'original') status('ORIGINAL TRACK NOT FOUND / CHECK public/music.wav');
  else status('AUDIO ERROR / TRY ANOTHER FILE');
});

async function startPlayback() {
  try {
    prepareAudio();
    await audioContext.resume();
    if (!audio.src) {
      audio.src = audioMode === 'original' ? ORIGINAL_AUDIO : '';
      audio.load();
    }
    await audio.play();
    status(audioMode === 'original'
      ? 'VISUAL+ ORIGINAL / AUDIO REACTIVE'
      : 'YOUR AUDIO / AUDIO REACTIVE');
  } catch (error) {
    console.error(error);
    status('PRESS PLAY TO START AUDIO / CHECK TRACK');
  }
}
$('vp-play').addEventListener('click', startPlayback);
$('vp-pause').addEventListener('click', () => {
  audio.pause();
  status('AUDIO PAUSED');
});
$('vp-seek').addEventListener('input', event => {
  if (audio.duration && Number.isFinite(audio.duration)) {
    audio.currentTime = Number(event.target.value) / 100 * audio.duration;
  }
});

// Attempt autoplay. Browsers may block audible autoplay; the scene still starts,
// and the first user tap/click anywhere on the page can unlock the original track.
let autoplayUnlocked = false;
async function tryAutoplay() {
  try {
    prepareAudio();
    await audioContext.resume();
    await audio.play();
    autoplayUnlocked = true;
    status('VISUAL+ ORIGINAL / AUTOPLAY ACTIVE');
  } catch (error) {
    status('SPACE ACTIVE / TAP PLAY FOR SOUND');
  }
}
window.addEventListener('pointerdown', () => {  if (autoplayUnlocked || audioMode !== 'original' || !audio.paused) return;
  autoplayUnlocked = true;
  startPlayback();
}, { once: true, passive: true });

function updateAudio() {
  if (!analyser || audio.paused) {
    bass *= 0.94;
    mid *= 0.94;
    treble *= 0.94;
    return;
  }

  analyser.getByteFrequencyData(audioData);

  const average = (start, end) => {
    let sum = 0;

    for (let i = start; i < end; i++) {
      sum += audioData[i];
    }

    return sum / Math.max(1, end - start) / 255;
  };

  bass += (average(0, 8) - bass) * 0.22;
  mid += (average(8, 35) - mid) * 0.18;
  treble += (average(35, 100) - treble) * 0.2;
}

// =====================================================
// STAR FIELD
// =====================================================

function makeStars(count, spread, size, opacity) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] =
      (Math.random() - 0.5) * spread;

    positions[i * 3 + 1] =
      (Math.random() - 0.5) * spread;

    positions[i * 3 + 2] =
      -Math.random() * 1100;

    const tint = Math.random();

    colors[i * 3] = 0.55 + tint * 0.35;
    colors[i * 3 + 1] = 0.62 + tint * 0.25;
    colors[i * 3 + 2] = 0.8 + tint * 0.2;
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );

  const material = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    sizeAttenuation: true,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return points;
}

const starsFar = makeStars(11000, 1000, 1.1, 0.8);
const starsMid = makeStars(3500, 650, 1.8, 0.7);
const starsNear = makeStars(1500, 300, 2.4, 0.65);

// =====================================================
// NEBULAE
// =====================================================

function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    128, 128, 2, 128, 128, 125
  );

  gradient.addColorStop(0, 'rgba(120,155,255,0.34)');
  gradient.addColorStop(0.25, 'rgba(65,85,170,0.19)');
  gradient.addColorStop(0.6, 'rgba(35,45,100,0.07)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  return new THREE.CanvasTexture(canvas);
}

const glowTexture = createGlowTexture();
const nebulae = [];

for (let i = 0; i < 22; i++) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: i % 3 === 0 ? 0x8b315e : 0x6e91df,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  sprite.position.set(
    (Math.random() - 0.5) * 420,
    (Math.random() - 0.5) * 250,
    -40 - i * 42
  );

  const scale = 40 + Math.random() * 85;
  sprite.scale.set(scale, scale * 0.7, 1);

  scene.add(sprite);
  nebulae.push(sprite);
}

// =====================================================
// PLANETS
// =====================================================

const planetColors = [
  0x607b9b,
  0x8c6c70,
  0x607c79,
  0x8d8795,
  0x354c67,
  0x9b795d,
  0x596b91,
  0x6d536f
];

const planets = [];

function createPlanet(index, x, y, z, radius) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const color = planetColors[index % planetColors.length];

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      metalness: 0.08
    })
  );

  group.add(sphere);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.045, 32, 32),
    new THREE.MeshBasicMaterial({
      color: index % 2 ? 0x8aaaff : 0x9b6688,
      transparent: true,
      opacity: 0.09,
      side: THREE.BackSide
    })
  );

  group.add(atmosphere);

  if (index % 3 === 0) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(radius * 1.35, radius * 1.85, 80),
      new THREE.MeshBasicMaterial({
        color: 0x9ca9c5,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide
      })
    );

    ring.rotation.x = Math.PI * 0.43;
    ring.rotation.y = 0.18;

    group.add(ring);
  }

  if (index % 5 === 0) {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.19, 20, 20),
      new THREE.MeshStandardMaterial({
        color: 0x9ba8bb,
        roughness: 1
      })
    );

    moon.position.set(
      radius * 1.8,
      radius * 0.4,
      radius * 0.4
    );

    group.add(moon);
  }

  scene.add(group);

  planets.push({
    group,
    radius,
    rotation: 0.03 + Math.random() * 0.08
  });
}

// Spread planets over a long route.
for (let i = 0; i < CONFIG.planets; i++) {
  const z = -45 - i * 27 - Math.random() * 24;
  const side = Math.random() < 0.5 ? -1 : 1;

  const x = side * (18 + Math.random() * 115);
  const y = (Math.random() - 0.5) * 95;
  const radius = 2.5 + Math.random() * 10;

  createPlanet(i, x, y, z, radius);
}

createPlanet(3, -145, 38, -360, 23);
createPlanet(5, 130, -48, -560, 29);
createPlanet(2, -95, -65, -760, 19);

// =====================================================
// DESTROYED PLANET
// =====================================================

const destroyedPlanet = new THREE.Group();
destroyedPlanet.position.set(13, -7, -205);
scene.add(destroyedPlanet);

const brokenCore = new THREE.Mesh(
  new THREE.SphereGeometry(9, 48, 48),
  new THREE.MeshStandardMaterial({
    color: 0x351b32,
    emissive: 0x8b244d,
    emissiveIntensity: 1.8,
    roughness: 0.45,
    metalness: 0.25
  })
);

destroyedPlanet.add(brokenCore);

const fragments = [];

const fragmentMaterial = new THREE.MeshStandardMaterial({
  color: 0x68758c,
  roughness: 0.95,
  metalness: 0.18,
  flatShading: true
});

for (let i = 0; i < 95; i++) {
  const size = 0.8 + Math.random() * 3.1;

  const fragment = new THREE.Mesh(
    new THREE.IcosahedronGeometry(size, 0),
    fragmentMaterial
  );

  const direction = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize();

  const distance = 11 + Math.random() * 16;

  fragment.position.copy(
    direction.clone().multiplyScalar(distance)
  );

  fragment.rotation.set(
    Math.random() * 3,
    Math.random() * 3,
    Math.random() * 3
  );

  destroyedPlanet.add(fragment);

  fragments.push({
    mesh: fragment,
    direction,
    spin: (Math.random() - 0.5) * 0.7
  });
}

const debrisRing = new THREE.Mesh(
  new THREE.TorusGeometry(24, 0.12, 5, 160),
  new THREE.MeshBasicMaterial({
    color: 0xb65b86,
    transparent: true,
    opacity: 0.65
  })
);

debrisRing.rotation.x = 1.15;
debrisRing.rotation.y = 0.3;
destroyedPlanet.add(debrisRing);

const explosionHalo = new THREE.Mesh(
  new THREE.SphereGeometry(29, 32, 32),
  new THREE.MeshBasicMaterial({
    color: 0x7d285b,
    transparent: true,
    opacity: 0.045,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);

destroyedPlanet.add(explosionHalo);

const explosionParticles = [];

for (let i = 0; i < 850; i++) {
  const particle = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.12 + Math.random() * 0.28,
      5,
      5
    ),
    new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xff789c : 0x91baff
    })
  );

  const direction = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  ).normalize();

  particle.position.copy(
    direction.clone().multiplyScalar(12 + Math.random() * 42)
  );

  destroyedPlanet.add(particle);

  explosionParticles.push({
    mesh: particle,
    direction,
    speed: 0.2 + Math.random() * 0.9
  });
}

// =====================================================
// SPACE DUST
// =====================================================

const dustGeometry = new THREE.BufferGeometry();
const dustPositions = new Float32Array(CONFIG.dust * 3);

for (let i = 0; i < CONFIG.dust; i++) {
  dustPositions[i * 3] = (Math.random() - 0.5) * 180;
  dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 120;
  dustPositions[i * 3 + 2] = -Math.random() * 1000;
}

dustGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(dustPositions, 3)
);

const dustMaterial = new THREE.PointsMaterial({
  color: 0xa5baff,
  size: 0.55,
  transparent: true,
  opacity: 0.5,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const dust = new THREE.Points(dustGeometry, dustMaterial);
scene.add(dust);// =====================================================
// PREVIEW / CINEMA MODE
// =====================================================

let cinemaMode = false;

function setCinemaMode(enabled) {
  cinemaMode = enabled;

  if (enabled) {
    renderer.setPixelRatio(1);
    renderer.setSize(
      CONFIG.cinemaWidth,
      CONFIG.cinemaHeight,
      false
    );

    camera.aspect =
      CONFIG.cinemaWidth / CONFIG.cinemaHeight;

    composer.setSize(
      CONFIG.cinemaWidth,
      CONFIG.cinemaHeight
    );

    bloomPass.resolution.set(
      CONFIG.cinemaWidth,
      CONFIG.cinemaHeight
    );

    status('CINEMA MODE / 2560x1440 / 60 FPS TARGET');

    $('vp-cinema').textContent = 'PREVIEW MODE';

  } else {
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setSize(
      window.innerWidth,
      window.innerHeight,
      false
    );

    camera.aspect =
      window.innerWidth / window.innerHeight;

    composer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    bloomPass.resolution.set(
      window.innerWidth,
      window.innerHeight
    );

    status('PREVIEW MODE');

    $('vp-cinema').textContent = 'CINEMA MODE / 1440P';
  }

  camera.updateProjectionMatrix();
}

$('vp-cinema').addEventListener('click', () => {
  setCinemaMode(!cinemaMode);
});

// =====================================================
// VIDEO RECORDING
// =====================================================

let recorder = null;
let recordedChunks = [];
let recordedBlob = null;
let recordingStream = null;

$('vp-record').addEventListener('click', async () => {
  try {
    if (!cinemaMode) {
      status('SWITCH TO CINEMA MODE BEFORE RECORDING');
      return;
    }

    if (recorder && recorder.state !== 'inactive') {
      status('RECORDING ALREADY ACTIVE');
      return;
    }

    prepareAudio();
    await audioContext.resume();

    const videoStream =
      renderer.domElement.captureStream(CONFIG.fps);

    recordingStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...recordDestination.stream.getAudioTracks()
    ]);

    recordedChunks = [];
    recordedBlob = null;

    const mimeType =
      MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : 'video/webm';

    recorder = new MediaRecorder(recordingStream, {
      mimeType,
      videoBitsPerSecond: CONFIG.videoBitrate,
      audioBitsPerSecond: CONFIG.audioBitrate
    });

    recorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    recorder.onstop = () => {
      recordedBlob = new Blob(recordedChunks, {
        type: 'video/webm'
      });

      status('RECORDING READY / PRESS SAVE WEBM');

      if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop());
        recordingStream = null;
      }
    };

    recorder.start(1000);

    status(
      audio.paused
        ? 'RECORDING / VIDEO ONLY — PRESS PLAY FOR MUSIC'
        : 'RECORDING / VIDEO + AUDIO'
    );

  } catch (error) {
    console.error(error);
    status('RECORDING ERROR / TRY CHROME OR EDGE');
  }
});

$('vp-stop').addEventListener('click', () => {
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
    status('PROCESSING RECORDING...');
  }
});

$('vp-save').addEventListener('click', () => {
  if (!recordedBlob) {
    status('NO VIDEO YET / RECORD FIRST');
    return;
  }

  const url = URL.createObjectURL(recordedBlob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'visualplus-deep-space-1440p.webm';
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 5000);

  status('VIDEO SAVED');
});

// =====================================================
// ANIMATION
// =====================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.04);

  updateAudio();

  const travelSpeed = CONFIG.speed + bass * 5;

  // Camera movement
  camera.position.z -= travelSpeed * dt;

  camera.position.x =
    Math.sin(clock.elapsedTime * 0.11) * 4 +
    Math.sin(clock.elapsedTime * 0.035) * 8;

  camera.position.y =
    Math.cos(clock.elapsedTime * 0.09) * 2.5;

  camera.rotation.z =
    Math.sin(clock.elapsedTime * 0.08) * 0.018;

  camera.rotation.x =
    Math.sin(clock.elapsedTime * 0.045) * 0.012;

  camera.fov = 65 + bass * 4;
  camera.updateProjectionMatrix();

  // Planets
  for (const planet of planets) {
    planet.group.rotation.y += planet.rotation * dt;
    planet.group.rotation.x += planet.rotation * 0.22 * dt;

    const distance =
      planet.group.position.z - camera.position.z;

    if (distance > 75) {
      planet.group.position.z -= 1050;

      planet.group.position.x =
        (Math.random() - 0.5) * 210;

      planet.group.position.y =
        (Math.random() - 0.5) * 120;
    }

    planet.group.scale.setScalar(1 + bass * 0.035);
  }

  // Destroyed world
  destroyedPlanet.rotation.y += dt * 0.035;
  destroyedPlanet.rotation.z += dt * 0.012;

  brokenCore.scale.setScalar(1 + bass * 0.12);

  explosionHalo.scale.setScalar(1 + bass * 0.18);

  explosionHalo.material.opacity =
    0.035 + bass * 0.09 + treble * 0.025;

  for (const fragment of fragments) {
    fragment.mesh.rotation.x += fragment.spin * dt;
    fragment.mesh.rotation.y += fragment.spin * 0.7 * dt;
  }

  for (const particle of explosionParticles) {
    particle.mesh.position.addScaledVector(
      particle.direction,
      particle.speed * dt * (1 + bass)
    );

    if (particle.mesh.position.length() > 55) {
      particle.mesh.position.copy(
        particle.direction.clone().multiplyScalar(12 + Math.random() * 5)
      );
    }
  }

  // Nebula movement
  for (const nebula of nebulae) {
    nebula.material.opacity = 0.2 + treble * 0.22;
    nebula.position.z += travelSpeed * dt * 0.12;

    if (nebula.position.z > camera.position.z + 80) {
      nebula.position.z -= 950;
    }
  }

  // Stars
  for (const starLayer of [starsFar, starsMid, starsNear]) {
    const positions =
      starLayer.geometry.attributes.position.array;

    const layerSpeed =
      starLayer === starsNear ? 1 :
      starLayer === starsMid ? 0.55 : 0.22;

    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += travelSpeed * dt * layerSpeed;

      if (positions[i] > camera.position.z + 30) {
        positions[i] -= 1100;
      }
    }

    starLayer.geometry.attributes.position.needsUpdate = true;
  }

  // Dust
  const dustArray = dust.geometry.attributes.position.array;

  for (let i = 2; i < dustArray.length; i += 3) {
    dustArray[i] += travelSpeed * dt * 0.8;

    if (dustArray[i] > camera.position.z + 25) {
      dustArray[i] -= 1000;
    }
  }

  dust.geometry.attributes.position.needsUpdate = true;

  dustMaterial.opacity = 0.3 + treble * 0.65;
  dustMaterial.size = 0.45 + treble * 1.2;

  // Audio-reactive lighting and bloom
  mainLight.intensity = 150 + bass * 220;
  redLight.intensity = 65 + mid * 100;

  bloomPass.strength = 0.75 + bass * 0.5;

  // Render with post-processing
  composer.render();
}

animate();

// =====================================================
// RESIZE
// =====================================================

window.addEventListener('resize', () => {
  if (cinemaMode) return;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight,
    false
  );

  composer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  bloomPass.resolution.set(
    window.innerWidth,
    window.innerHeight
  );
});

status('VISUAL+ ORIGINAL / STARTING');
tryAutoplay();

console.log('visual+ CODE_001 / DUAL AUDIO EDITION READY');