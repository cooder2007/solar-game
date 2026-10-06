import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const SUN_RADIUS = 7;

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

export function startSolarSystem3D(canvas, onSelect, onDeselect) {

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, 120, 110);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.minDistance = 10;
  controls.maxDistance = 400;

  scene.add(new THREE.AmbientLight(0x445577, 1.2));
  scene.add(new THREE.PointLight(0xffffff, 3, 0, 0)); // the Sun lights everything

  const starPositions = [];
  for (let i = 0; i < 1500; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 400);
    starPositions.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })));

  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  ));
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.3, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
  ));

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

  const hitMeshes = [];

  planets.forEach(function (p, i) {
    p.orbitRadius = LAYOUT[p.name].orbit;
    p.size = LAYOUT[p.name].size;
    p.speed = 15 / Math.pow(p.orbitDays, 0.75);          
    p.angle = (i / planets.length) * Math.PI * 2 + 0.5; 

    const pts = [];
    for (let k = 0; k < 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.orbitRadius, 0, Math.sin(a) * p.orbitRadius));
    }
    scene.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    ));

    p.group = new THREE.Group();
    scene.add(p.group);

    p.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.size, 48, 48),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.8, metalness: 0.0 })
    );
    p.group.add(p.mesh);

    if (p.name === "Saturn") {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(p.size * 1.25, p.size * 1.9, 64),
        new THREE.MeshBasicMaterial({ color: 0xcdbb8a, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
      );
      ring.rotation.x = Math.PI / 2 - 0.47;
      p.group.add(ring);
    }

    const label = makeLabel(p.name);
    label.position.y = p.size + 1.8;
    p.group.add(label);

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(p.size * 1.8, 2.5), 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.userData.planet = p;
    p.group.add(hit);
    hitMeshes.push(hit);
  });

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
    if (p) p.mesh.material.emissive.set(p.color).multiplyScalar(0.35);
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

  
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  
  const clock = new THREE.Clock();
  const sunPosition = new THREE.Vector3(0, 0, 0);

  function animate() {
    const dt = Math.min(clock.getDelta(), 0.1);

    planets.forEach(function (p) {
      p.angle += p.speed * dt * (p.name === "Venus" ? -1 : 1);
      
      p.group.position.set(
        Math.cos(p.angle) * p.orbitRadius,
        0,
        -Math.sin(p.angle) * p.orbitRadius
      );
      
      p.mesh.rotation.y += dt * (p.name === "Venus" ? -0.3 : 0.5);
    });
    
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
