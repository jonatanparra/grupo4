import confetti from 'canvas-confetti';

// genero un sonidito misterioso con el navegador, sin archivos
const sonidoHalloween = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    // notas que van bajando para que suene tenebroso
    const notas = [659, 523, 440, 330];
    notas.forEach((frecuencia, i) => {
      const osc = ctx.createOscillator();
      const volumen = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frecuencia;
      const inicio = ctx.currentTime + i * 0.18;
      volumen.gain.setValueAtTime(0.2, inicio);
      volumen.gain.exponentialRampToValueAtTime(0.001, inicio + 0.4);
      osc.connect(volumen);
      volumen.connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.4);
    });
  } catch (e) {
    // si el navegador no deja reproducir sonido, no pasa nada
  }
};

// lanzo emojis de halloween como confeti (versión intermedia)
export const confetiHalloween = () => {
  sonidoHalloween();

  // el scalar de las figuras y de la config deben ser iguales
  const calabaza = confetti.shapeFromText({ text: '🎃', scalar: 1.5 });
  const fantasma = confetti.shapeFromText({ text: '👻', scalar: 1.5 });
  const murcielago = confetti.shapeFromText({ text: '🦇', scalar: 1.5 });

  const config = {
    shapes: [calabaza, fantasma, murcielago],
    scalar: 1.5,
    colors: ['#ff6600', '#6a0dad', '#000000'],
    spread: 360,
    startVelocity: 30,
    ticks: 120,
    zIndex: 9999,
  };

  // explosión en el centro
  confetti({ ...config, particleCount: 75, origin: { x: 0.5, y: 0.5 } });

  // dos explosiones más a los lados
  setTimeout(() => {
    confetti({ ...config, particleCount: 50, origin: { x: 0.3, y: 0.4 } });
    confetti({ ...config, particleCount: 50, origin: { x: 0.7, y: 0.4 } });
  }, 300);

  // lluvia desde las esquinas durante 1.8 segundos
  const fin = Date.now() + 1800;
  const lluvia = setInterval(() => {
    if (Date.now() > fin) {
      clearInterval(lluvia);
      return;
    }
    confetti({ ...config, particleCount: 4, angle: 60, spread: 70, origin: { x: 0, y: 0.7 } });
    confetti({ ...config, particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 } });
  }, 200);
};