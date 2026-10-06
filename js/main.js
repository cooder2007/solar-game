import { startSolarSystem3D } from "./solar-system-3d.js";

const panel = document.getElementById("info-panel");

function showHome() {
  panel.innerHTML =
    "<h3>Solar System</h3>" +
    "<p>Click a planet to learn more. Drag to rotate, scroll to zoom.</p>" +
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
}

showHome();
startSolarSystem3D(document.getElementById("space"), showPlanetInfo, showHome);