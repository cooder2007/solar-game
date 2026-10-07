import { startSolarSystem3D } from "./solar-system-3d.js";

const panel = document.getElementById("info-panel");

// Calculator panel
const calcPanel = document.createElement("aside");
calcPanel.id = "calc-panel";
calcPanel.hidden = true;
document.body.appendChild(calcPanel);
initCalculator(calcPanel);

// Panel shared by Missions and Quiz
const gamePanel = document.createElement("aside");
gamePanel.id = "game-panel";
gamePanel.hidden = true;
document.body.appendChild(gamePanel);

// Only one left-side panel is visible at a time
function showPanel(which) {
  calcPanel.hidden = which !== "calc";
  gamePanel.hidden = which !== "missions" && which !== "quiz";
  if (which !== "missions") closeMissions();
}

function showHome() {
  panel.innerHTML =
    "<h3>Solar System</h3>" +
    "<p>Click a planet to learn more. Drag to rotate, scroll or pinch to zoom.</p>" +
    "<p><small>Distances, sizes, and speeds are scaled to fit the screen.</small></p>";
}

function showPlanetInfo(p) {
  panel.innerHTML =
    "<h3>" + p.name + "</h3>" +
    "<p>" + p.fact + "</p>" +
    "<p>Diameter: " + p.diameterKm.toLocaleString() + " km<br>" +
    "Surface gravity: " + p.gravity + " m/s²<br>" +
    "Distance from Sun: " + p.distanceAU + " AU<br>" +
    "Year length: " + p.orbitDays.toLocaleString() + " Earth days<br>" +
    "Day length: " + p.dayLength + "<br>" +
    "Moons: " + p.moons + "</p>";
  playSound("select");
  setCalculatorPlanet(p.name);   // keep the calculator in sync
  missionPlanetClicked(p.name);  // counts as an answer if a "pick" mission is active
}

// ---- Menu buttons ----
document.getElementById("btn-explore").addEventListener("click", function () {
  playSound("click");
  showPanel("none");
  showHome();
});

document.getElementById("btn-calc").addEventListener("click", function () {
  playSound("click");
  showPanel(calcPanel.hidden ? "calc" : "none");
});

document.getElementById("btn-missions").addEventListener("click", function () {
  playSound("click");
  showPanel("missions");
  openMissions(gamePanel);
});

document.getElementById("btn-quiz").addEventListener("click", function () {
  playSound("click");
  showPanel("quiz");
  openQuiz(gamePanel);
});

document.getElementById("btn-sound").addEventListener("click", function () {
  const on = toggleSound();
  this.textContent = on ? "🔊 Sound" : "🔇 Muted";
});

showHome();
startSolarSystem3D(document.getElementById("space"), showPlanetInfo, showHome);