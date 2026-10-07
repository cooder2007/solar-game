let missionIndex = 0;
let missionScore = 0;
let missionAttempts = 0;
let missionSolved = false;
let missionActive = false;
let missionPanel = null;

function openMissions(panel) {
  missionPanel = panel;
  missionActive = true;
  renderMission();
}

function closeMissions() {
  missionActive = false;
}

function restartMissions() {
  missionIndex = 0;
  missionScore = 0;
  missionAttempts = 0;
  missionSolved = false;
  renderMission();
}

function nextMission() {
  missionIndex++;
  missionAttempts = 0;
  missionSolved = false;
  renderMission();
}

function showMissionFeedback(message) {
  const box = document.getElementById("mission-feedback");
  if (box) box.textContent = message;
}

function renderMission() {
  if (missionIndex >= missions.length) {
    renderMissionEnd();
    return;
  }

  const m = missions[missionIndex];
  let body;

  if (missionSolved) {
    const label = missionIndex === missions.length - 1 ? "Finish" : "Next mission";
    body = `
      <div class="game-feedback good">✅ Correct! ${m.explain}</div>
      <button id="mission-next" class="game-btn">${label}</button>`;
  } else if (m.type === "calc") {
    body = `
      <input id="mission-answer" type="number" step="any" placeholder="Answer in ${m.unit}">
      <button id="mission-submit" class="game-btn">Submit</button>
      <button id="mission-hint" class="game-btn secondary">Hint</button>
      <div id="mission-feedback" class="game-feedback"></div>`;
  } else {
    body = `
      <p><em>Click a planet in the 3D view to answer.</em></p>
      <button id="mission-hint" class="game-btn secondary">Hint</button>
      <div id="mission-feedback" class="game-feedback"></div>`;
  }

  missionPanel.innerHTML = `
    <h3>Mission ${missionIndex + 1} of ${missions.length}</h3>
    <p class="game-score">Score: ${missionScore}</p>
    <h4>${m.title}</h4>
    <p>${m.text}</p>
    ${body}`;

  // Connect the buttons that exist in this view
  const next = document.getElementById("mission-next");
  if (next) next.addEventListener("click", nextMission);

  const hint = document.getElementById("mission-hint");
  if (hint) hint.addEventListener("click", function () { showMissionFeedback("💡 " + m.hint); });

  const submit = document.getElementById("mission-submit");
  if (submit) {
    submit.addEventListener("click", function () {
      const value = parseFloat(document.getElementById("mission-answer").value);
      if (isNaN(value)) {
        showMissionFeedback("Type a number first.");
      } else {
        checkMissionAnswer(value);
      }
    });
  }
}

function checkMissionAnswer(given) {
  const m = missions[missionIndex];
  const correct = (m.type === "calc")
    ? Math.abs(given - m.answer) <= m.tolerance
    : given === m.answer;
  playSound(correct ? "correct" : "wrong");
  if (correct) {
    // 100 points on the first try, minus 25 for each earlier miss (never below 25)
    missionScore += Math.max(25, 100 - 25 * missionAttempts);
    missionSolved = true;
    renderMission();
  } else {
    missionAttempts++;
    showMissionFeedback("❌ Not quite. Try again (each miss costs 25 points).");
  }
}

// Called from main.js whenever the player clicks a planet
function missionPlanetClicked(name) {
  if (!missionActive || missionIndex >= missions.length) return;
  if (missions[missionIndex].type !== "pick" || missionSolved) return;
  checkMissionAnswer(name);
}

function renderMissionEnd() {
  const best = missions.length * 100;
  const ratio = missionScore / best;
  const rank = ratio >= 0.9 ? "Mission Commander 🚀" : ratio >= 0.6 ? "Pilot 🛰️" : "Cadet 🌍";

  missionPanel.innerHTML = `
    <h3>All missions complete!</h3>
    <p class="game-score">Final score: ${missionScore} / ${best}</p>
    <p>Your rank: <strong>${rank}</strong></p>
    <button id="mission-restart" class="game-btn">Play again</button>`;
  document.getElementById("mission-restart").addEventListener("click", restartMissions);
}