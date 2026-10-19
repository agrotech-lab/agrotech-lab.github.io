(() => {
  'use strict';
  const HIGH = 3.3;
  const plot = { left: 60, right: 616, top: 28, bottom: 230 };
  const width = plot.right - plot.left;
  const height = plot.bottom - plot.top;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const svgText = (x, y, text, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}">${text}</text>`;
  const fixed = (v, places = 3) => v.toFixed(places);

  function grid(root, xMax, yMax, xTitle, yTitle) {
    const lines = [];
    for (let i = 0; i <= 4; i++) {
      const x = plot.left + width * i / 4;
      const y = plot.bottom - height * i / 4;
      lines.push(`<path class="demo-gridline" d="M${x},${plot.top}V${plot.bottom} M${plot.left},${y}H${plot.right}"/>`);
      lines.push(svgText(x, plot.bottom + 20, Number((xMax * i / 4).toFixed(3))));
    }
    lines.push(svgText(plot.left - 10, plot.bottom + 4, '0', 'end'));
    lines.push(svgText(plot.left - 10, plot.top + 4, yMax, 'end'));
    lines.push(svgText(plot.left, 17, yTitle, 'start'));
    lines.push(svgText(plot.left + width / 2, 269, xTitle));
    root.querySelector('[data-grid]').innerHTML = lines.join('');
  }

  // A number field supports precise examples; the range supports live teaching.
  function pair(range, number, update) {
    range.addEventListener('input', () => {
      number.value = range.value;
      number.removeAttribute('aria-invalid');
      update();
    });
    const acceptNumber = () => {
      const value = number.valueAsNumber;
      if (!Number.isFinite(value) || value < +range.min || value > +range.max) {
        number.setAttribute('aria-invalid', 'true');
        return;
      }
      range.value = value;
      number.removeAttribute('aria-invalid');
      update();
    };
    number.addEventListener('input', acceptNumber);
    number.addEventListener('change', () => {
      if (!Number.isFinite(number.valueAsNumber)) number.value = range.value;
      number.value = clamp(number.valueAsNumber, +range.min, +range.max);
      range.value = number.value;
      number.value = range.value;
      number.removeAttribute('aria-invalid');
      update();
    });
  }

  function initADC(root) {
    const voltage = root.querySelector('#adc-voltage');
    const voltageNumber = root.querySelector('#adc-voltage-number');
    const bitsInput = root.querySelector('#adc-bits');
    const set = (id, text) => { root.querySelector(`#adc-${id}`).textContent = text; };
    let lastBits;
    function update() {
      const bits = +bitsInput.value;
      const levels = 2 ** bits;
      const max = levels - 1;
      const vin = +voltage.value;
      const step = HIGH / levels;
      // Ideal equal-width bins; clip the upper endpoint to the last code.
      const code = Math.min(max, Math.floor(vin / step + 1e-12));
      const binary = code.toString(2).padStart(bits, '0');
      set('bits-value', `${bits} bits`);
      set('levels', levels.toLocaleString('en-US'));
      set('maximum', max.toLocaleString('en-US'));
      set('step', `${fixed(step * 1000)} mV`);
      set('code', code);
      set('binary', `${binary}₂`);
      set('formula', `2^${bits} = ${levels} possible values, numbered 0–${max}.`);
      set('bin', `The same code covers ${fixed(code * step, 4)} V ≤ input ${code === max ? '≤' : '<'} ${fixed((code + 1) * step, 4)} V.`);
      voltage.setAttribute('aria-valuetext', `${fixed(vin, 4)} volts`);
      bitsInput.setAttribute('aria-valuetext', `${bits} bits, ${levels} possible codes`);
      root.querySelector('#adc-bit-tiles').innerHTML = binary.split('').map((bit, i) => `<span class="demo-bit ${bit === '1' ? 'is-one' : ''}"><b>${bit}</b><small>×${2 ** (bits - i - 1)}</small></span>`).join('');
      if (bits !== lastBits) {
        grid(root, HIGH, max, 'Input voltage (V)', 'Digital code');
        const path = [`M${plot.left},${plot.bottom}`];
        for (let codeIndex = 0; codeIndex < levels; codeIndex++) {
          path.push(`V${fixed(plot.bottom - height * codeIndex / max)}H${fixed(plot.left + width * (codeIndex + 1) / levels)}`);
        }
        root.querySelector('[data-staircase]').setAttribute('d', path.join(''));
        lastBits = bits;
      }
      const x = plot.left + width * vin / HIGH;
      const y = plot.bottom - height * code / max;
      root.querySelector('[data-guide]').setAttribute('d', `M${plot.left},${y}H${x}V${plot.bottom}`);
      root.querySelector('[data-marker]').setAttribute('cx', x);
      root.querySelector('[data-marker]').setAttribute('cy', y);
      set('plot-description', `${bits}-bit ideal ADC. Input ${fixed(vin, 4)} volts gives code ${code} out of ${max}, binary ${binary}.`);
    }
    pair(voltage, voltageNumber, update);
    bitsInput.addEventListener('input', update);
    root.querySelectorAll('[data-bits]').forEach(button => button.addEventListener('click', () => { bitsInput.value = button.dataset.bits; update(); }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      voltage.value = voltageNumber.value = '1.65'; bitsInput.value = '3';
      voltageNumber.removeAttribute('aria-invalid'); update();
    });
    update();
  }

  function initPWM(root) {
    const dutyInput = root.querySelector('#pwm-duty');
    const dutyNumber = root.querySelector('#pwm-duty-number');
    const frequency = root.querySelector('#pwm-frequency');
    const windowInput = root.querySelector('#pwm-window');
    const set = (id, text) => { root.querySelector(`#pwm-${id}`).textContent = text; };
    function update() {
      const duty = +dutyInput.value / 100;
      const hz = +frequency.value;
      const period = 1000 / hz;
      const windowMs = windowInput.value === 'periods' ? period * 2 : +windowInput.value;
      const average = HIGH * duty;
      set('frequency-value', `${hz.toLocaleString('en-US')} Hz`);
      set('average', `${fixed(average)} V`);
      set('period', `${fixed(period)} ms`);
      set('on-time', `${fixed(period * duty)} ms`);
      set('formula', `Average voltage = ${fixed(duty, 2)} × 3.3 V = ${fixed(average)} V`);
      dutyInput.setAttribute('aria-valuetext', `${dutyInput.value} percent HIGH`);
      frequency.setAttribute('aria-valuetext', `${hz} hertz`);
      grid(root, windowMs, HIGH, 'Time (ms)', 'Pin voltage (V)');
      const x = ms => plot.left + width * ms / windowMs;
      const path = [`M${plot.left},${duty === 0 ? plot.bottom : plot.top}`];
      const fills = [];
      if (duty === 0 || duty === 1) {
        path.push(`H${plot.right}`);
        if (duty === 1) fills.push(`<rect class="demo-pulse-fill" x="${plot.left}" y="${plot.top}" width="${width}" height="${height}"/>`);
      } else {
        for (let cycle = 0; cycle * period < windowMs - 1e-10; cycle++) {
          const start = cycle * period;
          const endHigh = Math.min(windowMs, start + period * duty);
          const endCycle = Math.min(windowMs, start + period);
          path.push(`V${plot.top}H${fixed(x(endHigh))}`);
          if (endHigh < windowMs) path.push(`V${plot.bottom}H${fixed(x(endCycle))}`);
          fills.push(`<rect class="demo-pulse-fill" x="${fixed(x(start))}" y="${plot.top}" width="${fixed(x(endHigh) - x(start))}" height="${height}"/>`);
        }
      }
      root.querySelector('[data-pulses]').innerHTML = fills.join('');
      root.querySelector('[data-wave]').setAttribute('d', path.join(''));
      const averageY = plot.bottom - height * duty;
      root.querySelector('[data-average]').setAttribute('d', `M${plot.left},${averageY}H${plot.right}`);
      set('plot-description', `${dutyInput.value} percent duty at ${hz} hertz. Time average ${fixed(average)} volts. Period ${fixed(period)} milliseconds; HIGH for ${fixed(period * duty)} milliseconds. Showing ${fixed(windowMs)} milliseconds.`);
    }
    pair(dutyInput, dutyNumber, update);
    frequency.addEventListener('input', update);
    windowInput.addEventListener('change', update);
    root.querySelectorAll('[data-duty]').forEach(button => button.addEventListener('click', () => {
      dutyInput.value = dutyNumber.value = button.dataset.duty;
      dutyNumber.removeAttribute('aria-invalid'); update();
    }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      dutyInput.value = dutyNumber.value = '50'; frequency.value = '500'; windowInput.value = '10';
      dutyNumber.removeAttribute('aria-invalid'); update();
    });
    update();
  }

  function init() {
    document.querySelectorAll('[data-demo]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'adc') initADC(root);
      if (root.dataset.demo === 'pwm') initPWM(root);
      const button = root.querySelector('[data-fullscreen]');
      if (document.fullscreenEnabled && root.requestFullscreen) {
        button.hidden = false;
        button.addEventListener('click', async () => {
          try {
            if (document.fullscreenElement === root) await document.exitFullscreen();
            else await root.requestFullscreen();
          } catch (_) { /* The controls still work if fullscreen is unavailable. */ }
        });
        document.addEventListener('fullscreenchange', () => {
          button.textContent = document.fullscreenElement === root ? 'Exit enlarged view' : 'Enlarge demo';
        });
      }
      root.dataset.ready = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
