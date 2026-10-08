let soundOn = true;
let audioCtx = null;
function playTone(freq, start, duration, type, volume)
{
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const t = audioCtx.currentTime + start;
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + duration);
}
function playSound(name)
{
  if (!soundOn) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  if (name === "click")
  {
    playTone(520, 0, 0.08, "sine", 0.15);
  } 
  else if (name === "select")
  {
    playTone(660, 0, 0.1, "triangle", 0.15);
    playTone(880, 0.08, 0.12, "triangle", 0.15);
  }
  else if (name === "correct")
  {
    playTone(523, 0, 0.14, "triangle", 0.2);
    playTone(659, 0.12, 0.14, "triangle", 0.2);
    playTone(784, 0.24, 0.25, "triangle", 0.2);
  }
  else if (name === "wrong")
  {
    playTone(200, 0, 0.3, "sawtooth", 0.12);
  }
}

function toggleSound()
{
  soundOn = !soundOn;
  return soundOn;
}