import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { addMoons, addRings, addAsteroidBelt } from "./extras.js";

const SUN_RADIUS = 7;
const LAYOUT =
{
  Mercury: { orbit: 14,  size: 0.8 },
  Venus:   { orbit: 20,  size: 1.3 },
  Earth:   { orbit: 27,  size: 1.4 },
  Mars:    { orbit: 34,  size: 1.0 },
  Jupiter: { orbit: 50,  size: 3.2 },
  Saturn:  { orbit: 70,  size: 2.7 },
  Uranus:  { orbit: 88,  size: 2.0 },
  Neptune: { orbit: 104, size: 2.0 }
};

const TILT =
{
  Mercury: 0.03, Venus: 177.4, Earth: 23.4, Mars: 25.2,
  Jupiter: 3.1, Saturn: 26.7, Uranus: 97.8, Neptune: 28.3
};

const TEXTURE_FILES =
{
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

const SPACECRAFT_FILE = "models/iss.glb";
const SPACECRAFT_LENGTH = 0.9;
const SPACECRAFT_ORBIT = 2.4;

export function startSolarSystem3D(canvas, onSelect, onDeselect)
{
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 2000);
  camera.position.set(0, 120, 110);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  let lastWheel = 0;
  canvas.addEventListener("wheel", function (e)
  {
    e.preventDefault();
    e.stopImmediatePropagation();
    const now = performance.now();
    if (now - lastWheel < 40) return;
    lastWheel = now;
    desiredDist = null;
    const minDist = selected ? 4 : 14;
    const maxDist = 250;
    const offset = camera.position.clone().sub(controls.target);
    const factor = e.deltaY > 0 ? 1.1 : 1 / 1.1;
    const dist = THREE.MathUtils.clamp(offset.length() * factor, minDist, maxDist);
    camera.position.copy(controls.target).add(offset.setLength(dist));
  }, 
  { passive: false });

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.zoomSpeed = 0.5;
  controls.minDistance = 14;
  controls.maxDistance = 250;
  const manager = new THREE.LoadingManager();
  manager.onLoad = function () {
    document.getElementById("loading").classList.add("hidden");
  };
  setTimeout(function ()
  {
    document.getElementById("loading").classList.add("hidden");
  }, 10000);
  const loader = new THREE.TextureLoader(manager);
  function applyTexture(material, path)
  {
    loader.load(
      path,
      function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        material.map = tex;
        material.color.set(0xffffff);
        material.needsUpdate = true;
      },
      undefined,
      function () { console.warn("Texture NOT found:", path);

      }
    );
  }
  const gltfLoader = new GLTFLoader(manager);
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/");
  gltfLoader.setDRACOLoader(dracoLoader);
  let spacecraft = null;
  function loadSpacecraft(parent)
  {
    gltfLoader.load(
      SPACECRAFT_FILE,
      function (gltf)
      {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = SPACECRAFT_LENGTH / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.copy(center).multiplyScalar(-scale);
        const pivot = new THREE.Group();
        pivot.add(model);
        parent.add(pivot);
        spacecraft = { pivot: pivot, angle: 0 };
        console.log("Spacecraft model loaded:", SPACECRAFT_FILE);
      },
      undefined,
      function (error)
      {
        console.warn("Model NOT found:", SPACECRAFT_FILE, error);
      }
    );
  }

  scene.add(new THREE.AmbientLight(0x445577, 1.2));
  scene.add(new THREE.PointLight(0xffffff, 3, 0, 0)); // the Sun lights everything

  const starPositions = [];
  for (let i = 0; i < 1500; i++)
  {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(300 + Math.random() * 400);
    starPositions.push(v.x, v.y, v.z);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 1.2, sizeAttenuation: false })));

  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS, 48, 48), sunMaterial));
  applyTexture(sunMaterial, TEXTURE_FILES.Sun);
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS * 1.3, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
  ));

  function makeLabel(text)
  {
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
  planets.forEach(function (p, i)
  {
    p.orbitRadius = LAYOUT[p.name].orbit;
    p.size = LAYOUT[p.name].size;
    p.speed = 15 / Math.pow(p.orbitDays, 0.75);
    p.angle = (i / planets.length) * Math.PI * 2 + 0.5;
    const pts = [];
    for (let k = 0; k < 128; k++)
    {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.orbitRadius, 0, Math.sin(a) * p.orbitRadius));
    }
    scene.add(new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })
    ));
    p.group = new THREE.Group();
    scene.add(p.group);
    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = THREE.MathUtils.degToRad(TILT[p.name]);
    p.group.add(tiltGroup);
    p.tiltGroup = tiltGroup;
    const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(p.color), roughness: 0.9, metalness: 0.0 });
    p.mesh = new THREE.Mesh(new THREE.SphereGeometry(p.size, 64, 64), material);
    tiltGroup.add(p.mesh);
    applyTexture(material, TEXTURE_FILES[p.name]);
    if (p.name === "Saturn")
    {
      const inner = p.size * 1.25;
      const outer = p.size * 1.9;
      const ringGeo = new THREE.RingGeometry(inner, outer, 96);
      const pos = ringGeo.attributes.position;
      const uv = ringGeo.attributes.uv;
      const v = new THREE.Vector3();
      for (let k = 0; k < pos.count; k++)
      {
        v.fromBufferAttribute(pos, k);
        uv.setXY(k, (v.length() - inner) / (outer - inner), 0.5);
      }

      const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xcdbb8a, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      tiltGroup.add(ring);
      applyTexture(ringMaterial, TEXTURE_FILES.SaturnRing);
    }
    if (p.name === "Earth")
    {
      loadSpacecraft(p.group);
    }
    const label = makeLabel(p.name);
    label.position.y = p.size + 2;
    p.group.add(label);
    const hit = new THREE.Mesh
    (
      new THREE.SphereGeometry(Math.max(p.size * 1.8, 2.5), 8, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    hit.userData.planet = p;
    p.group.add(hit);
    hitMeshes.push(hit);
  });
  addRings(planets);
  const moons = addMoons(planets, makeLabel);
  const belt = addAsteroidBelt(scene);
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function pick(event)
  {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitMeshes);
    return hits.length ? hits[0].object.userData.planet : null;
  }
  let selected = null;
  function select(p)
  {
    if (selected) selected.mesh.material.emissive.setHex(0x000000);
    selected = p;
    moons.showLabels(p);
    if (p) p.mesh.material.emissive.set(p.color).multiplyScalar(0.25);
  }
  let downX = 0, downY = 0;
  canvas.addEventListener("pointerdown", function (e)
  {
    downX = e.clientX; downY = e.clientY;
  }
);
  canvas.addEventListener("pointerup", function (e)
  {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
    const hit = pick(e);
    select(hit);
    if (hit) onSelect(hit);
    else if (onDeselect) onDeselect();
  });
  canvas.addEventListener("pointermove", function (e)
  {
    canvas.style.cursor = pick(e) ? "pointer" : "default";
  }
);
  function resize()
  {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  const clock = new THREE.Clock();
  const sunPosition = new THREE.Vector3(0, 0, 0);
  let desiredDist = null;
  function animate()
  {
    const dt = Math.min(clock.getDelta(), 0.1);
    planets.forEach(function (p)
    {
      p.angle += p.speed * dt;
      p.group.position.set
      (
        Math.cos(p.angle) * p.orbitRadius,
        0,
        -Math.sin(p.angle) * p.orbitRadius
      );
      p.mesh.rotation.y += dt * 0.5;
    }
  );
    moons.update(dt);
    belt.update(dt);
    if (spacecraft)
    {
      spacecraft.angle += dt * 1.2;
      const a = spacecraft.angle;
      spacecraft.pivot.position.set(
        Math.cos(a) * SPACECRAFT_ORBIT,
        Math.sin(a) * SPACECRAFT_ORBIT * 0.4,
        -Math.sin(a) * SPACECRAFT_ORBIT * 0.9
      );
    }
    const focus = selected ? selected.group.position : sunPosition;
    const before = controls.target.clone();
    controls.target.lerp(focus, 0.08);
    camera.position.add(controls.target.clone().sub(before));
    if (desiredDist !== null)
    {
    const off = camera.position.clone().sub(controls.target);
    const d = THREE.MathUtils.lerp(off.length(), desiredDist, 0.05);
    camera.position.copy(controls.target).add(off.setLength(d));
    if (Math.abs(d - desiredDist) < 0.3) desiredDist = null;
    }
    controls.minDistance = selected ? 4 : 14;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
    animate();
  return{
    resetView: function ()
    {
      select(null);
      desiredDist = 165;
    },
    focusPlanet: function (p)
    {
      select(p);
      desiredDist = p.size * 7;
      onSelect(p);
    }
  };
}