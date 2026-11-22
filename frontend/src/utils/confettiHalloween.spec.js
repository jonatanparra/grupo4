import { confetiHalloween } from "./confettiHalloween";

describe("confetiHalloween (bonus)", () => {
  // Reloj falso: los setTimeout/setInterval del confeti avanzan solo con tick(),
  // así la prueba (y la cobertura) no dependen del tiempo real.
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 9, 31));
  });
  afterEach(() => jasmine.clock().uninstall());

  it("lanza las explosiones y detiene la lluvia de emojis después de 1,8 s", () => {
    // La lluvia consulta Date.now() en cada intervalo: si sigue activa, las llamadas aumentan.
    const ahora = spyOn(Date, "now").and.callThrough();

    expect(() => confetiHalloween()).not.toThrow();
    jasmine.clock().tick(300); // explosiones laterales + lluvia en curso
    const llamadasDuranteLluvia = ahora.calls.count();
    jasmine.clock().tick(1800);
    expect(ahora.calls.count()).toBeGreaterThan(llamadasDuranteLluvia);

    const llamadasAlTerminar = ahora.calls.count();
    jasmine.clock().tick(1000); // la lluvia ya se detuvo (clearInterval)
    expect(ahora.calls.count()).toBe(llamadasAlTerminar);
  });

  it("no falla si el navegador no permite reproducir sonido", () => {
    spyOn(window, "AudioContext").and.throwError("Audio bloqueado");

    expect(() => confetiHalloween()).not.toThrow();
    expect(window.AudioContext).toHaveBeenCalled();
    jasmine.clock().tick(2100);
  });
});
