const CALC_G = 6.674e-11;   // gravitational constant
const EARTH_G = 9.81;       // Earth's surface gravity (m/s²)

// Weight (a force, in newtons) = mass × gravity
function calcWeightN(massKg, gravity) {
  return massKg * gravity;
}

// Kepler's third law: T² = a³  (T in Earth years, a in AU)
function calcOrbitalPeriodYears(distanceAU) {
  return Math.pow(distanceAU, 1.5);
}

// Escape velocity: v = √(2GM / r), returned in km/s
function calcEscapeVelocityKmS(massE24, diameterKm) {
  const mass = massE24 * 1e24;
  const radius = (diameterKm / 2) * 1000;
  return Math.sqrt((2 * CALC_G * mass) / radius) / 1000;
}

function initCalculator(panel) {
  const options = planets.map(function (p) {
    return '<option value="' + p.name + '">' + p.name + "</option>";
  }).join("");

  panel.innerHTML = `
    <h3>Physics Calculator</h3>
    <label for="calc-mass">Your mass (kg)</label>
    <input id="calc-mass" type="number" value="50" min="1" max="500" step="1">
    <label for="calc-planet">Planet</label>
    <select id="calc-planet">${options}</select>
    <div id="calc-output"></div>
  `;

  document.getElementById("calc-planet").value = "Mars";
  document.getElementById("calc-mass").addEventListener("input", updateCalculator);
  document.getElementById("calc-planet").addEventListener("change", updateCalculator);
  updateCalculator();
}

// Lets the 3D view change the dropdown when you click a planet
function setCalculatorPlanet(name) {
  const select = document.getElementById("calc-planet");
  if (select) {
    select.value = name;
    updateCalculator();
  }
}

function updateCalculator() {
  const out = document.getElementById("calc-output");
  const mass = parseFloat(document.getElementById("calc-mass").value);

  // Validate the input before calculating
  if (isNaN(mass) || mass <= 0 || mass > 500) {
    out.innerHTML = '<p class="calc-error">Enter a mass between 1 and 500 kg.</p>';
    return;
  }

  const name = document.getElementById("calc-planet").value;
  const p = planets.find(function (planet) { return planet.name === name; });

  const weightN = calcWeightN(mass, p.gravity);
  const feelsLikeKg = weightN / EARTH_G;
  const periodYears = calcOrbitalPeriodYears(p.distanceAU);
  const escapeKmS = calcEscapeVelocityKmS(p.massE24, p.diameterKm);
  const jumpM = 0.5 * EARTH_G / p.gravity; // same take-off speed as a 0.5 m jump on Earth

  // Bar chart: weight on every planet
  const maxWeight = Math.max.apply(null, planets.map(function (q) { return calcWeightN(mass, q.gravity); }));
  const bars = planets.map(function (q) {
    const w = calcWeightN(mass, q.gravity);
    return `
      <div class="bar-row">
        <span class="bar-name">${q.name}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${(w / maxWeight) * 100}%; background:${q.color}"></span></span>
        <span class="bar-value">${w.toFixed(0)} N</span>
      </div>`;
  }).join("");

  out.innerHTML = `
    <div class="calc-result">
      <strong>On ${p.name}</strong><br>
      Weight: ${weightN.toFixed(1)} N (feels like ${feelsLikeKg.toFixed(1)} kg on Earth)<br>
      Year length (Kepler): ${periodYears.toFixed(2)} Earth years<br>
      Escape velocity: ${escapeKmS.toFixed(1)} km/s<br>
      A 0.5 m jump on Earth reaches about ${jumpM.toFixed(2)} m here
    </div>
    <p><small>Your <em>mass</em> (${mass} kg) never changes. Only your <em>weight</em> does, because gravity differs.</small></p>
    <strong>Your weight on every planet</strong>
    ${bars}
    <p><small>Gas giants have no solid surface, so values use the cloud tops.</small></p>
  `;
}