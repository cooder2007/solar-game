const planets = [
  { name: "Mercury", color: "#b5b5b5", diameterKm: 4879,   gravity: 3.70,  distanceAU: 0.387, massE24: 0.330, orbitDays: 88,     dayLength: "58.6 Earth days", moons: 0,
    fact: "Mercury has almost no atmosphere, so temperatures swing from scorching to freezing." },
  { name: "Venus",   color: "#e8c27a", diameterKm: 12104,  gravity: 8.87,  distanceAU: 0.723, massE24: 4.87,  orbitDays: 224.7,  dayLength: "243 Earth days",  moons: 0,
    fact: "Venus is the hottest planet, and it spins backwards compared to most planets." },
  { name: "Earth",   color: "#3b82f6", diameterKm: 12756,  gravity: 9.81,  distanceAU: 1.000, massE24: 5.97,  orbitDays: 365.2,  dayLength: "24 hours",        moons: 1,
    fact: "Earth is the only known planet with liquid water on its surface." },
  { name: "Mars",    color: "#ef4444", diameterKm: 6792,   gravity: 3.71,  distanceAU: 1.524, massE24: 0.642, orbitDays: 687,    dayLength: "24.6 hours",      moons: 2,
    fact: "Mars is home to Olympus Mons, the tallest volcano in the solar system." },
  { name: "Jupiter", color: "#d6a77a", diameterKm: 142984, gravity: 24.79, distanceAU: 5.203, massE24: 1898,  orbitDays: 4333,   dayLength: "9.9 hours",       moons: 95,
    fact: "Jupiter's Great Red Spot is a storm larger than Earth." },
  { name: "Saturn",  color: "#e3d4a0", diameterKm: 120536, gravity: 10.44, distanceAU: 9.537, massE24: 568,   orbitDays: 10759,  dayLength: "10.7 hours",      moons: 146,
    fact: "Saturn's rings are made mostly of ice and are very thin compared to their width." },
  { name: "Uranus",  color: "#7de3e3", diameterKm: 51118,  gravity: 8.87,  distanceAU: 19.19, massE24: 86.8,  orbitDays: 30687,  dayLength: "17.2 hours",      moons: 28,
    fact: "Uranus rotates tilted on its side, so it seems to roll around the Sun." },
  { name: "Neptune", color: "#4f6bed", diameterKm: 49528,  gravity: 11.15, distanceAU: 30.07, massE24: 102,   orbitDays: 60190,  dayLength: "16.1 hours",      moons: 16,
    fact: "Neptune has the fastest winds in the solar system." }
];
// ---- Missions ----
// type "pick": the player clicks a planet. type "calc": the player types a number.
const missions = [
  {
    type: "pick", title: "Strongest Pull",
    text: "Find the planet with the strongest surface gravity.",
    answer: "Jupiter",
    hint: "Click planets and compare 'Surface gravity' in the info panel.",
    explain: "Jupiter's gravity is 24.79 m/s², about 2.5 times Earth's."
  },
  {
    type: "pick", title: "Shortest Year",
    text: "Find the planet that completes its orbit around the Sun the fastest.",
    answer: "Mercury",
    hint: "Compare 'Year length' in the info panel. Planets closer to the Sun move faster.",
    explain: "Mercury's year is only 88 Earth days."
  },
  {
    type: "pick", title: "Longest Day",
    text: "Find the planet where one day (one spin on its axis) lasts the longest.",
    answer: "Venus",
    hint: "Compare 'Day length' in the info panel.",
    explain: "A day on Venus (243 Earth days) is longer than its year (about 225 Earth days)."
  },
  {
    type: "calc", title: "Touchdown on Mars", unit: "N",
    text: "A 60 kg astronaut is about to land on Mars, where gravity is 3.71 m/s². What will they weigh there, in newtons?",
    answer: 222.6, tolerance: 1,
    hint: "Weight = mass × gravity.",
    explain: "60 × 3.71 = 222.6 N. On Earth the same astronaut weighs 588.6 N."
  },
  {
    type: "calc", title: "A Martian Year", unit: "Earth years",
    text: "Mars orbits at 1.524 AU from the Sun. Use Kepler's third law (T = a^1.5) to find how many Earth years one Mars year lasts.",
    answer: 1.88, tolerance: 0.05,
    hint: "Calculate 1.524 to the power of 1.5. Try Math in a calculator, or use the Calculator panel and select Mars.",
    explain: "1.524^1.5 ≈ 1.88 years, which is about 687 Earth days."
  },
  {
    type: "calc", title: "Escape Earth", unit: "km/s",
    text: "How fast must a rocket travel to escape Earth's gravity, in km/s? (Open the Calculator and select Earth. Your mission progress is kept.)",
    answer: 11.2, tolerance: 0.3,
    hint: "The Calculator shows escape velocity for the selected planet.",
    explain: "Escape velocity is √(2GM/r), about 11.2 km/s for Earth."
  }
];

// ---- Quiz ----
// answer = index of the correct option (starting from 0)
const quizQuestions = [
  {
    question: "Which planet has the shortest day?",
    options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 2,
    explain: "Jupiter spins once in about 9.9 hours, even though it's the largest planet."
  },
  {
    question: "Which planet rotates on its side, tilted about 98°?",
    options: ["Neptune", "Uranus", "Saturn", "Mars"], answer: 1,
    explain: "Uranus is tipped over, so it seems to roll around the Sun."
  },
  {
    question: "An astronaut has a mass of 70 kg on Earth. What is their mass on the Moon?",
    options: ["About 12 kg", "70 kg", "About 420 kg", "0 kg"], answer: 1,
    explain: "Mass doesn't change with location. Only weight does, because gravity is different."
  },
  {
    question: "About how long does Neptune take to orbit the Sun once?",
    options: ["12 years", "30 years", "165 years", "1,000 years"], answer: 2,
    explain: "Kepler's third law: Neptune is about 30 AU away, so T = 30^1.5 ≈ 165 years."
  },
  {
    question: "Which statement about Venus is true?",
    options: [
      "It orbits the Sun backwards",
      "It spins backwards on its axis",
      "It has the most moons",
      "It is the closest planet to the Sun"
    ], answer: 1,
    explain: "Venus orbits in the same direction as the other planets, but it rotates backwards."
  },
  {
    question: "Which of these planets needs the highest escape velocity?",
    options: ["Earth", "Saturn", "Jupiter", "Neptune"], answer: 2,
    explain: "Jupiter's mass is huge. Escaping it takes about 59.5 km/s, versus 11.2 km/s for Earth."
  },
  {
    question: "What does 1 AU (astronomical unit) measure?",
    options: [
      "The average distance from Earth to the Sun",
      "The mass of the Sun",
      "The speed of light",
      "The size of Jupiter"
    ], answer: 0,
    explain: "1 AU is about 150 million km, the average Earth–Sun distance."
  },
  {
    question: "Which planet is home to Olympus Mons, the tallest volcano in the solar system?",
    options: ["Venus", "Mars", "Earth", "Mercury"], answer: 1,
    explain: "Olympus Mons on Mars is roughly two to three times the height of Mount Everest."
  }
];