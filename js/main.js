import { startSolarSystem3D } from "./solar-system-3d.js";

const panel = document.getElementById("info-panel");
const exploreBtn = document.getElementById("btn-explore");


const calcPanel = document.createElement("aside");
calcPanel.id = "calc-panel";
calcPanel.hidden = true;
document.body.appendChild(calcPanel);
initCalculator(calcPanel);


const gamePanel = document.createElement("aside");
gamePanel.id = "game-panel";
gamePanel.hidden = true;
document.body.appendChild(gamePanel);


function showPanel(which)
{
  calcPanel.hidden = which !== "calc";
  gamePanel.hidden = which !== "missions" && which !== "quiz";
  if (which !== "missions") closeMissions();
}

function showHome()
{
  panel.innerHTML =
    "<h3>Solar System</h3>" +
    "<p>Click a planet to learn more, or press <strong>Explore</strong> for a guided tour. Drag to rotate, scroll or pinch to zoom.</p>" +
    "<p><small>Distances, sizes, and speeds are scaled to fit the screen.</small></p>";
}

function showPlanetInfo(p)
{
  panel.innerHTML =
    "<h3>" + p.name + "</h3>" +
    "<p>" + p.fact + "</p>" +
    "<p>Diameter: " + p.diameterKm.toLocaleString() + " km<br>" +
    "Surface gravity: " + p.gravity + " m/s²<br>" +
    "Distance from Sun: " + p.distanceAU + " AU<br>" +
    "Year length: " + p.orbitDays.toLocaleString() + " Earth days<br>" +
    "Day length: " + p.dayLength + "<br>" +
    "Moons: " + p.moons + " (the biggest are shown in 3D)</p>";
  playSound("select");
  setCalculatorPlanet(p.name);
  missionPlanetClicked(p.name);
}

let tourTimer = null;
let tourIndex = 0;

function stopTour() 
{
  if (tourTimer === null) return;
  clearInterval(tourTimer);
  tourTimer = null;
  exploreBtn.textContent = "Explore";
}

function tourStep()
{
  if (tourIndex >= planets.length) 
  {
    stopTour();
    view.resetView();
    showHome();
    return;
  }
  view.focusPlanet(planets[tourIndex]);
  tourIndex++;
}

function startTour()
{
  tourIndex = 0;
  exploreBtn.textContent = "⏹ Stop tour";
  tourStep();
  tourTimer = setInterval(tourStep, 7000);
}

exploreBtn.addEventListener("click", function ()
{
  playSound("click");
  showPanel("none");
  if (tourTimer !== null)
  {
    stopTour();
    view.resetView();
    showHome();
  } 
  else
  {
    startTour();
  }
}
);

document.getElementById("btn-calc").addEventListener("click", function ()
{
  playSound("click");
  stopTour();
  showPanel(calcPanel.hidden ? "calc" : "none");
}
);

document.getElementById("btn-missions").addEventListener("click", function ()
{
  playSound("click");
  stopTour();
  showPanel("missions");
  openMissions(gamePanel);
});

document.getElementById("btn-quiz").addEventListener("click", function ()
{
  playSound("click");
  stopTour();
  showPanel("quiz");
  openQuiz(gamePanel);
});

document.getElementById("btn-sound").addEventListener("click", function ()
{
  const on = toggleSound();
  this.textContent = on ? "🔊 Sound" : "🔇 Muted";
}
);

document.getElementById("space").addEventListener("pointerdown", stopTour);

showHome();
const view = startSolarSystem3D(document.getElementById("space"), showPlanetInfo, showHome);
