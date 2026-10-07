import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SUN_RADIUS = 7;

// Hand-picked layout (scene units). Not to scale, chosen so nothing overlaps.
const LAYOUT = {
  Mercury: { orbit: 14,  size: 0.8 },
  Venus:   { orbit: 20,  size: 1.3 },
  Earth:   { orbit: 27,  size: 1.4 },
  Mars:    { orbit: 34,  size: 1.0 },
  Jupiter: { orbit: 50,  size: 3.2 },
  Saturn:  { orbit: 70,  size: 2.7 },
  Uranus:  { orbit: 88,  size: 2.0 },
  Neptune: { orbit: 104, size: 2.0 }
};

// Real axial tilt in degrees. Venus (177) and Uranus (98) explain their odd spins.
const TILT = {
  Mercury: 0.03, Venus: 177.4, Earth: 23.4, Mars: 25.2,
  Jupiter: 3.1, Saturn: 26.7, Uranus: 97.8, Neptune: 28.3
};

const TEXTURE_FILES = {
  Sun:     "textures/2k_sun.jpg",
  Mercury: "textures/2k_mercury.jpg",
  Venus:   "textures/2k_venus_surface.jpg",
  Earth:   "textures/2k_earth_daymap.jpg",
  Mars:    "textures/2k_mars.jpg",
  Jupiter: "textures/2k_jupiter.jpg",
  Saturn:  "textures/2k_saturn.jpg",
  Uranus:  "textures/2k_uranus.jpg",
  Neptune: "textures/2k_neptune.jpg",
  SaturnRing: "textures/2k_saturn_ring_alpha.png"
};

export function startSolarSystem3D(canvas, onSelect, onDeselect) {
  // ---- Scene, camera, renderer ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, 120, 110);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 400;

  // ---- Texture loading (falls back to plain color if a file is missing) ----
  const loader = new THREE.TextureLoader();
  function applyTexture(material, path) {
    loader.load(
      path,
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        material.map = tex;
        material.color.set(0xffffff); // show the texture's true colors
        material.needsUpdate = true;
      },
      undefined,
      function () { console.warn("Texture not found, using plain color:", path); }
    );
  }

  // ---- Lights ----
  scene.add(new THREE.AmbientLight(0x445577, 1.2));
  scene.add(new THREE.PointLight(0xffffff, 3, 0, 0)); // the Sun lights everything

  // ---- Stars ----
  const starPositions = [];
  for (let i = 0; i < 1500; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 400);
    starPositions.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })));

  // ---- Sun ----
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 48, 48), sunMaterial));
  applyTexture(sunMaterial, TEXTURE_FILES.Sun);
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.3, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
  ));

  // ---- Text labels ----
  function makeLabel(text) {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 64;
    const g = c.getContext("2d");
    g.font = "bold 30px Segoe UI, Arial";
    g.fillStyle = "#cbd5e1";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(text, 128, 32);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
    sprite.scale.set(9, 2.25, 1);
    return sprite;
  }

  // ---- Planets ----
  const hitMeshes = [];

  planets.forEach(function (p, i) {
    p.orbitRadius = LAYOUT[p.name].orbit;
    p.size = LAYOUT[p.name].size;
    p.speed = 15 / Math.pow(p.orbitDays, 0.75);          // radians per second
    p.angle = (i / planets.length) * Math.PI * 2 + 0.5;  // evenly spread start positions

    // Orbit line
    const pts = [];
    for (let k = 0; k < 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.orbitRadius, 0, Math.sin(a) * p.orbitRadius));
    }
    scene.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    ));

    // Planet group (moves along the orbit)
    p.group = new THREE.Group();
    scene.add(p.group);

    // Tilt group (tilts the planet's axis; the mesh spins inside it)
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(TILT[p.name]);
    p.group.add(tiltGroup);

    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9, metalness: 0.0 });
    p.mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 64, 64), material);
    tiltGroup.add(p.mesh);
    applyTexture(material, TEXTURE_FILES[p.name]);

    // Saturn's ring: lies in the planet's equator, so the tilt group tilts it automatically
    if (p.name === "Saturn") {
      const inner = p.size * 1.25;
      const outer = p.size * 1.9;
      const ringGeo = new THREE.RingGeometry(inner, outer, 96);

      // Re-map the texture so it runs from the inner edge to the outer edge
      const pos = ringGeo.attributes.position;
      const uv = ringGeo.attributes.uv;
      const v = new THREE.Vector3();
      for (let k = 0; k < pos.count; k++) {
        v.fromBufferAttribute(pos, k);
        uv.setXY(k, (v.length() - inner) / (outer - inner), 0.5);
      }

      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xcdbb8a, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      tiltGroup.add(ring);
      applyTexture(ringMaterial, TEXTURE_FILES.SaturnRing);
    }

    const label = makeLabel(p.name);
    label.position.y = p.size + 2;
    p.group.add(label);

    // Invisible, bigger sphere so small planets are easier to click
    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(p.size * 1.8, 2.5), 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.userData.planet = p;
    p.group.add(hit);
    hitMeshes.push(hit);
  });

  // ---- Picking (click and hover) ----
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitMeshes);
    return hits.length ? hits[0].object.userData.planet : null;
  }

  let selected = null;
  function select(p) {
    if (selected) selected.mesh.material.emissive.setHex(0x000000);
    selected = p;
    if (p) p.mesh.material.emissive.set(p.color).multiplyScalar(0.25);
  }

  let downX = 0, downY = 0;
  canvas.addEventListener("pointerdown", function (e) { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener("pointerup", function (e) {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return; // it was a drag, not a click
    const hit = pick(e);
    select(hit);
    if (hit) onSelect(hit);
    else if (onDeselect) onDeselect();
  });
  canvas.addEventListener("pointermove", function (e) {
    canvas.style.cursor = pick(e) ? "pointer" : "default";
  });

  // ---- Resize ----
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  // ---- Animation loop ----
  const clock = new THREE.Clock();
  const sunPosition = new THREE.Vector3(0, 0, 0);

  function animate() {
    const dt = Math.min(clock.getDelta(), 0.1);

    planets.forEach(function (p) {
      p.angle += p.speed * dt; // every planet orbits the same direction
      // Minus sign on z = counterclockwise when seen from above
      p.group.position.set(
        Math.cos(p.angle) * p.orbitRadius,
        0,
        -Math.sin(p.angle) * p.orbitRadius
      );
      // Same spin for all; the axial tilt makes Venus and Uranus look "backwards"/sideways
      p.mesh.rotation.y += dt * 0.5;
    });

    // Smoothly move the view toward the selected planet (or back to the Sun)
    const focus = selected ? selected.group.position : sunPosition;
    const before = controls.target.clone();
    controls.target.lerp(focus, 0.08);
    camera.position.add(controls.target.clone().sub(before));

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}