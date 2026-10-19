(() => {
  'use strict';
  const fixed = (v, n = 3) => v.toFixed(n);
  const currentText = amps => amps >= 1 ? `${fixed(amps)} A` : amps > 0 && amps < 0.000001 ? `${fixed(amps * 1e6)} µA` : `${fixed(amps * 1000)} mA`;
  const powerText = watts => watts >= 1 ? `${fixed(watts)} W` : `${fixed(watts * 1000)} mW`;
  const setter = (root, prefix) => (id, value) => {
    const node = root.querySelector(`#${prefix}-${id}`);
    if (node.textContent !== value) node.textContent = value;
  };
  function pair(root, id, update, unit) {
    const range = root.querySelector(`#${id}`);
    const number = root.querySelector(`#${id}-number`);
    range.addEventListener('input', () => { number.value = range.value; number.removeAttribute('aria-invalid'); update(); });
    number.addEventListener('input', () => {
      const value = number.valueAsNumber;
      if (!Number.isFinite(value) || value < +range.min || value > +range.max) { number.setAttribute('aria-invalid', 'true'); return; }
      range.value = value; number.removeAttribute('aria-invalid'); update();
    });
    number.addEventListener('change', () => {
      const value = Number.isFinite(number.valueAsNumber) ? number.valueAsNumber : +range.value;
      range.value = Math.max(+range.min, Math.min(+range.max, value));
      number.value = range.value; number.removeAttribute('aria-invalid'); update();
    });
    return {
      get value() { return +range.value; },
      set(value) { range.value = value; number.value = range.value; number.removeAttribute('aria-invalid'); },
      announce() { range.setAttribute('aria-valuetext', `${range.value} ${unit}`); }
    };
  }
  function initResistor(root) {
    const set = setter(root, 'resistor');
    const mode = root.querySelector('#resistor-mode');
    const rating = root.querySelector('#resistor-rating');
    const limit = root.querySelector('#resistor-limit');
    let lastLimit = +limit.value;
    const voltage = pair(root, 'resistor-voltage', update, 'volts');
    const resistance = pair(root, 'resistor-resistance', update, 'ohms');
    const forward = pair(root, 'resistor-forward', update, 'volts');
    function update() {
      const led = mode.value === 'led';
      root.querySelectorAll('[data-led-control]').forEach(el => { el.hidden = !led; });
      // SVG elements do not implement HTMLElement.hidden consistently.
      root.querySelector('#resistor-led-symbol').toggleAttribute('hidden', !led);
      root.querySelector('#resistor-bypass').toggleAttribute('hidden', led);
      [voltage, resistance, forward].forEach(control => control.announce());
      const v = voltage.value, r = resistance.value, vf = forward.value;
      set('source-label', `${v} V`); set('r-label', `R = ${r} Ω`);
      const status = root.querySelector('#resistor-status');
      if (r === 0) {
        for (const id of ['current', 'drop', 'power', 'current-label']) set(id, '—');
        set('drop-label', 'VR: not calculated'); set('led-label', '—');
        set('formula', 'Choose R > 0 Ω to calculate I = VR / R.');
        set('status', led ? 'Zero resistance: this model cannot determine the current through an LED without a series resistor.' : 'Zero resistance: this ideal source/resistor model cannot determine a finite current. Choose R > 0 Ω.');
        status.dataset.state = 'undefined';
        set('circuit-caption', 'Current and power are not calculated at zero resistance.');
        set('circuit-description', 'Zero resistance. Current and power are not calculated in this ideal model.');
        root.querySelector('#resistor-led-body').setAttribute('fill', 'white');
        return;
      }
      const drop = led ? Math.max(0, v - vf) : v;
      const current = drop / r;
      const power = current * current * r;
      set('current', currentText(current)); set('drop', `${fixed(drop)} V`); set('power', powerText(power));
      set('current-label', currentText(current)); set('drop-label', `VR = ${fixed(drop)} V`);
      set('led-label', `${fixed(Math.min(v, vf))} V`);
      root.querySelector('#resistor-led-body').setAttribute('fill', current > 0 ? '#ffd166' : 'white');
      set('formula', `I = ${fixed(drop)} / ${r} = ${fixed(current, 6)} A; PR = I² × R = ${fixed(power, 6)} W`);
      const messages = [];
      const overPower = power > +rating.value + 1e-12;
      const overCurrent = led && current * 1000 > lastLimit + 1e-9;
      if (led && v <= vf) messages.push('LED off in this model: the supply is at or below the selected forward drop.');
      messages.push(overPower ? `Resistor power exceeds the selected ${powerText(+rating.value)} rating.` : `Resistor power ${Math.abs(power - +rating.value) < 1e-12 ? 'is at' : 'is below'} the selected ${powerText(+rating.value)} rating.`);
      if (led) messages.push(overCurrent ? `LED current exceeds the entered ${lastLimit} mA limit.` : `LED current is at or below the entered ${lastLimit} mA limit.`);
      set('status', messages.join(' ')); status.dataset.state = overPower || overCurrent ? 'limit' : 'normal';
      set('circuit-caption', led ? `Supply = resistor drop + LED voltage: ${fixed(v)} = ${fixed(drop)} + ${fixed(Math.min(v, vf))} V.` : 'The whole supply voltage is across the resistor.');
      set('circuit-description', `${v} volt supply, ${r} ohm resistor${led ? ` and a model LED with ${vf} volt forward drop` : ''}. Current ${currentText(current)}. Resistor drop ${fixed(drop)} volts, resistor power ${powerText(power)}.`);
    }
    mode.addEventListener('change', update); rating.addEventListener('change', update);
    limit.addEventListener('input', () => {
      if (!limit.validity.valid || !Number.isFinite(limit.valueAsNumber)) { limit.setAttribute('aria-invalid', 'true'); return; }
      lastLimit = limit.valueAsNumber; limit.removeAttribute('aria-invalid'); update();
    });
    limit.addEventListener('change', () => {
      lastLimit = Math.round(Math.max(1, Math.min(100, Number.isFinite(limit.valueAsNumber) ? limit.valueAsNumber : lastLimit)));
      limit.value = lastLimit; limit.removeAttribute('aria-invalid'); update();
    });
    function reset(example = 'plain') {
      mode.value = example === 'plain' ? 'plain' : 'led'; voltage.set(example === 'led10' ? 10 : 3.3);
      resistance.set(330); forward.set(2); rating.value = '0.25'; lastLimit = 20; limit.value = '20'; limit.removeAttribute('aria-invalid'); update();
    }
    root.querySelectorAll('[data-resistor-example]').forEach(button => button.addEventListener('click', () => reset(button.dataset.resistorExample)));
    root.querySelector('[data-reset]').addEventListener('click', () => reset());
    update();
  }
  function initDivider(root) {
    const set = setter(root, 'divider');
    const voltage = pair(root, 'divider-voltage', update, 'volts');
    const r1 = pair(root, 'divider-r1', update, 'kilo-ohms');
    const r2 = pair(root, 'divider-r2', update, 'kilo-ohms');
    const double = root.querySelector('[data-divider-double]');
    function update() {
      const v = voltage.value, top = r1.value, bottom = r2.value;
      const total = top + bottom;
      [voltage, r1, r2].forEach(control => control.announce());
      set('supply-label', `Vin = ${v} V`); set('r1-label', `R1 = ${top} kΩ`); set('r2-label', `R2 = ${bottom} kΩ`);
      double.disabled = top > 50 || bottom > 50 || total === 0;
      double.title = double.disabled ? 'Doubling requires at least one nonzero resistor and both values at or below 50 kΩ.' : 'Double both resistances while keeping their ratio.';
      const status = root.querySelector('#divider-status');
      if (total === 0) {
        for (const id of ['output', 'current', 'adc', 'output-label']) set(id, '—');
        set('top-drop', 'Drop: undefined'); set('bottom-drop', 'Drop: undefined');
        set('ratio', 'Both resistors are zero, so their ratio is undefined.');
        set('formula', 'Choose R1 + R2 > 0 to calculate a divider ratio.');
        set('status', 'Both resistors are zero. The ideal model cannot determine an output voltage or finite current.');
        status.dataset.state = 'undefined'; set('circuit-description', 'Both resistors are zero. Divider output and current are undefined.');
        return;
      }
      const ratio = bottom / total;
      const output = v * ratio;
      const current = v / (total * 1000);
      const outside = output > 3.3 + 1e-12;
      set('output', `${fixed(output)} V`); set('current', currentText(current)); set('output-label', `${fixed(output)} V`);
      set('adc', outside ? 'Out of range' : String(Math.min(4095, Math.floor(output / 3.3 * 4096 + 1e-12))));
      set('top-drop', `Drop: ${fixed(v - output)} V`); set('bottom-drop', `Drop: ${fixed(output)} V`);
      set('ratio', `R2 is ${fixed(ratio * 100, 1)}% of the total resistance, so Vout is ${fixed(ratio * 100, 1)}% of Vin.`);
      set('formula', `Vout = ${v} × ${bottom} / (${top} + ${bottom}) = ${fixed(output)} V`);
      set('status', outside ? 'Vout exceeds the ideal ADC model’s 3.3 V range. No ADC code is shown; a clipped code would hide the excess voltage.' : 'The ideal ADC model uses 4,096 equal intervals across 0–3.3 V.');
      status.dataset.state = outside ? 'limit' : 'normal';
      set('circuit-description', `${v} volt supply, upper resistor ${top} kilo-ohms and lower resistor ${bottom} kilo-ohms. Output ${fixed(output)} volts and series current ${currentText(current)}.`);
    }
    root.querySelectorAll('[data-divider-preset]').forEach(button => button.addEventListener('click', () => {
      const [top, bottom] = button.dataset.dividerPreset.split(',').map(Number); r1.set(top); r2.set(bottom); update();
    }));
    root.querySelector('[data-divider-swap]').addEventListener('click', () => { const top = r1.value; r1.set(r2.value); r2.set(top); update(); });
    double.addEventListener('click', () => { r1.set(r1.value * 2); r2.set(r2.value * 2); update(); });
    root.querySelector('[data-reset]').addEventListener('click', () => { voltage.set(3.3); r1.set(10); r2.set(10); update(); });
    update();
  }
  function init() {
    document.querySelectorAll('[data-demo=resistor], [data-demo=divider]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'resistor') initResistor(root); else initDivider(root);
      const button = root.querySelector('[data-fullscreen]');
      if (document.fullscreenEnabled && root.requestFullscreen) {
        button.hidden = false;
        button.addEventListener('click', async () => {
          try { if (document.fullscreenElement === root) await document.exitFullscreen(); else await root.requestFullscreen(); }
          catch (_) { /* Keep the inline controls usable if fullscreen is unavailable. */ }
        });
        document.addEventListener('fullscreenchange', () => { button.textContent = document.fullscreenElement === root ? 'Exit enlarged view' : 'Enlarge demo'; });
      }
      root.dataset.ready = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
