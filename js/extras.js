import * as THREE from "three";

const RING_DATA =
{
  Jupiter:
  [
    { from: 1.25, to: 1.33, color: 0x9c8b73, opacity: 0.30 },
    { from: 1.38, to: 1.42, color: 0x8a7a66, opacity: 0.25 }
  ],
  Uranus:
  [
    { from: 1.30, to: 1.34, color: 0xbfe9ee, opacity: 0.45 },
    { from: 1.45, to: 1.50, color: 0xbfe9ee, opacity: 0.40 },
    { from: 1.62, to: 1.68, color: 0xbfe9ee, opacity: 0.50 }
  ],
  Neptune:
  [
    { from: 1.70, to: 1.74, color: 0x8fa0d9, opacity: 0.30 },
    { from: 2.00, to: 2.05, color: 0x8fa0d9, opacity: 0.30 }
  ]
};

export function addRings(planets)
{
  planets.forEach(function (p)
  {
    const rings = RING_DATA[p.name];
    if (!rings) return;

    rings.forEach(function (r)
    {
      const geometry = new THREE.RingGeometry(p.size * r.from, p.size * r.to, 128);
      const material = new THREE.MeshBasicMaterial(
        {
        color: r.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: r.opacity,
        depthWrite: false
      }
    );
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      p.tiltGroup.add(ring);
    }
  );
  }
);
}

const MOONS =
{
  Earth:
  [
    { name: "Moon",      orbit: 4.2, size: 0.38, period: 27.3,  color: "#c9c9c9", plane: "ecliptic" }
  ],
  Mars:
  [
    { name: "Phobos",    orbit: 1.8, size: 0.12, period: 0.32,  color: "#8b7d6b" },
    { name: "Deimos",    orbit: 2.5, size: 0.10, period: 1.26,  color: "#9a8c7a" }
  ],
  Jupiter:
  [
    { name: "Io",        orbit: 5.2, size: 0.30, period: 1.77,  color: "#e8d36a" },
    { name: "Europa",    orbit: 6.0, size: 0.28, period: 3.55,  color: "#d9c9a8" },
    { name: "Ganymede",  orbit: 7.0, size: 0.40, period: 7.15,  color: "#9d8f80" },
    { name: "Callisto",  orbit: 8.0, size: 0.37, period: 16.69, color: "#6b5f55" }
  ],
  Saturn:
  [
    { name: "Enceladus", orbit: 6.3,  size: 0.14, period: 1.37,  color: "#f2f2f2" },
    { name: "Rhea",      orbit: 7.6,  size: 0.22, period: 4.52,  color: "#cfcfcf" },
    { name: "Titan",     orbit: 9.3,  size: 0.40, period: 15.95, color: "#d9a441" },
    { name: "Iapetus",   orbit: 12.0, size: 0.20, period: 79.3,  color: "#8a8378" }
  ],
  Uranus:
  [
    { name: "Miranda",   orbit: 4.0, size: 0.12, period: 1.41,  color: "#bdbdbd" },
    { name: "Ariel",     orbit: 4.8, size: 0.16, period: 2.52,  color: "#d0d0d0" },
    { name: "Umbriel",   orbit: 5.6, size: 0.16, period: 4.14,  color: "#8c8c8c" },
    { name: "Titania",   orbit: 6.6, size: 0.20, period: 8.7,   color: "#b5aaa0" },
    { name: "Oberon",    orbit: 7.6, size: 0.19, period: 13.46, color: "#9d928a" }
  ],
  Neptune:
  [
    { name: "Proteus",   orbit: 5.0, size: 0.13, period: 1.12,  color: "#8a8a8a" },
    { name: "Triton",    orbit: 6.6, size: 0.30, period: -5.88, color: "#d8c8c0" }  // backwards!
  ]
};

export function addMoons(planets, makeLabel)
{
  const moonList = [];

  planets.forEach(function (p)
  {
    const defs = MOONS[p.name];
    if (!defs) return;

    defs.forEach(function (def)
    {
      const parent = def.plane === "ecliptic" ? p.group : p.tiltGroup;
      const pts = [];
      for (let k = 0; k < 64; k++)
      {
        const a = (k / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * def.orbit, 0, Math.sin(a) * def.orbit));
      }
      parent.add(new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
      ));

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(def.size, 24, 24),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(def.color), roughness: 0.95 })
      );
      parent.add(mesh);

      const label = makeLabel(def.name);
      label.scale.set(4.5, 1.125, 1);
      label.position.y = def.size + 0.6;
      label.visible = false;
      mesh.add(label);

      const direction = def.period < 0 ? -1 : 1;
      const speed = Math.min(2, 3 / Math.pow(Math.abs(def.period), 0.6)) * direction;

      moonList.push(
        {
        planet: p, def: def, mesh: mesh, label: label,
        speed: speed, angle: Math.random() * Math.PI * 2
      }
    );
    }
  );
  }
);

  return{
    update: function (dt)
    {
      moonList.forEach(function (m)
      {
        m.angle += m.speed * dt;
        m.mesh.position.set(
          Math.cos(m.angle) * m.def.orbit,0,-Math.sin(m.angle) * m.def.orbit
        );
      });
    },
    showLabels: function (selectedPlanet)
    {
      moonList.forEach(function (m)
      {
        m.label.visible = (m.planet === selectedPlanet);
      }
    );
    }
  };
}

export function addAsteroidBelt(scene)
{
  const COUNT = 2700;
  const INNER = 38;
  const OUTER = 44;
  const mesh = new THREE.InstancedMesh
  (
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    COUNT
  );

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  for (let i = 0; i < COUNT; i++)
    {
    const angle = Math.random() * Math.PI * 2;
    const r = INNER + ((Math.random() + Math.random()) / 2) * (OUTER - INNER);
    dummy.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 1.6, Math.sin(angle) * r);
    dummy.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    const s = 0.25 + Math.random() * 0.45;
    dummy.scale.set(s, s * (0.6 + Math.random() * 0.5), s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    const shade = 0.55 + Math.random() * 0.35;
    color.setRGB(shade, shade * 0.93, shade * 0.85);
    mesh.setColorAt(i, color);
  }
  mesh.instanceColor.needsUpdate = true;
  scene.add(mesh);

  return {
    update: function (dt) { mesh.rotation.y += dt * 0.02; }
  };
}