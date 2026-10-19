(() => {
  'use strict';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const numberText = (value, places = 1) => value.toLocaleString('en-US', { minimumFractionDigits: places, maximumFractionDigits: places });
  const durationText = hours => hours < 1 ? `${numberText(hours * 60)} minutes` : hours < 48 ? `${numberText(hours)} hours` : `${numberText(hours / 24)} days`;

  // Keep precise numeric entry and classroom sliders in sync.
  function pair(range, number, update, unit) {
    range.addEventListener('input', () => {
      number.value = range.value;
      number.removeAttribute('aria-invalid');
      update();
    });
    number.addEventListener('input', () => {
      const value = number.valueAsNumber;
      if (!Number.isFinite(value) || value < +range.min || value > +range.max) {
        number.setAttribute('aria-invalid', 'true');
        return;
      }
      range.value = value;
      number.removeAttribute('aria-invalid');
      update();
    });
    number.addEventListener('change', () => {
      const value = Number.isFinite(number.valueAsNumber) ? number.valueAsNumber : +range.value;
      range.value = clamp(value, +range.min, +range.max);
      number.value = range.value;
      number.removeAttribute('aria-invalid');
      update();
    });
    return {
      get value() { return +range.value; },
      set(value) { range.value = number.value = value; number.removeAttribute('aria-invalid'); },
      announce() { range.setAttribute('aria-valuetext', `${range.value} ${unit}`); }
    };
  }

  function initRGB(root) {
    const set = (id, value) => { root.querySelector(`#rgb-${id}`).textContent = value; };
    const channels = ['red', 'green', 'blue'].map(name => pair(root.querySelector(`#rgb-${name}`), root.querySelector(`#rgb-${name}-number`), update, 'out of 255'));
    function update() {
      const rgb = channels.map(channel => channel.value);
      const css = `rgb(${rgb.join(', ')})`;
      const hex = '#' + rgb.map(value => value.toString(16).padStart(2, '0')).join('').toUpperCase();
      set('decimal', css);
      set('hex', hex);
      set('code', `strip.setLedColorData(0, ${rgb.join(', ')});\nstrip.show();`);
      const swatch = root.querySelector('#rgb-swatch');
      swatch.style.backgroundColor = css;
      swatch.setAttribute('aria-label', `Mixed colour: red ${rgb[0]}, green ${rgb[1]}, blue ${rgb[2]}; hex ${hex}`);
      ['red', 'green', 'blue'].forEach((name, i) => {
        root.querySelector(`[data-light=${name}]`).setAttribute('fill', `rgb(${rgb.map((v, j) => j === i ? v : 0).join(',')})`);
        channels[i].announce();
      });
      set('mixing-description', `Red ${rgb[0]}, green ${rgb[1]}, blue ${rgb[2]}. The centre combines all three channels to make ${hex}.`);
    }
    const choose = values => { values.forEach((v, i) => channels[i].set(v)); update(); };
    root.querySelectorAll('[data-colour]').forEach(button => button.addEventListener('click', () => choose(button.dataset.colour.split(',').map(Number))));
    root.querySelector('[data-reset]').addEventListener('click', () => choose([255, 128, 0]));
    update();
  }

  function initSleep(root) {
    const set = (id, value) => { root.querySelector(`#sleep-${id}`).textContent = value; };
    const names = ['active-current', 'idle-current', 'active-time', 'idle-time', 'capacity', 'usable'];
    const defaults = [80, 50, 2, 58, 2000, 80];
    const units = ['milliamps', 'microamps', 'seconds', 'seconds', 'milliamp hours', 'percent'];
    const controls = names.map((name, i) => pair(root.querySelector(`#sleep-${name}`), root.querySelector(`#sleep-${name}-number`), update, units[i]));
    function update() {
      const [awakeCurrent, sleepMicroamps, awakeSeconds, sleepSeconds, capacity, usablePercent] = controls.map(control => control.value);
      const sleepCurrent = sleepMicroamps / 1000;
      const cycle = awakeSeconds + sleepSeconds;
      // Current is battery-side mA; durations are seconds. Dividing their
      // weighted sum by cycle seconds gives mA, so capacity / average is hours.
      const awakeCharge = awakeCurrent * awakeSeconds;
      const sleepCharge = sleepCurrent * sleepSeconds;
      const totalCharge = awakeCharge + sleepCharge;
      const average = totalCharge / cycle;
      const usable = capacity * usablePercent / 100;
      const hours = usable / average;
      const awakeHours = usable / awakeCurrent;
      const timeShare = awakeSeconds / cycle;
      const chargeShare = awakeCharge / totalCharge;
      const averageText = average < 0.001 ? `${numberText(average * 1000, 3)} µA` : `${numberText(average, 3)} mA`;
      set('average', averageText);
      set('runtime', durationText(hours));
      set('gain', `${numberText(awakeCurrent / average)}×`);
      set('budget', `${numberText(usable, 0)} mAh usable · ${numberText(hours, hours < 1 ? 3 : 1)} hours estimated. Always awake: ${durationText(awakeHours)}.`);
      set('cycle', `One cycle = ${awakeSeconds} s awake + ${sleepSeconds} s asleep = ${numberText(cycle, Number.isInteger(cycle) ? 0 : 1)} s.`);
      set('formula', `Iavg = (${awakeCurrent} × ${awakeSeconds} + ${sleepCurrent} × ${sleepSeconds}) / ${Number(cycle.toFixed(1))} = ${averageText}`);
      root.querySelector('#sleep-time-bar').setAttribute('width', 564 * timeShare);
      root.querySelector('#sleep-charge-bar').setAttribute('width', 564 * chargeShare);
      set('time-label', `Awake ${numberText(timeShare * 100)}% · asleep ${numberText((1 - timeShare) * 100)}%`);
      set('charge-label', `Awake ${numberText(chargeShare * 100)}% · asleep ${numberText((1 - chargeShare) * 100)}%`);
      set('plot-description', `Awake for ${numberText(timeShare * 100)} percent of the time, using ${numberText(chargeShare * 100)} percent of the charge. Average current ${averageText}.`);
      controls.forEach(control => control.announce());
    }
    root.querySelectorAll('[data-timing]').forEach(button => button.addEventListener('click', () => {
      const [awake, asleep] = button.dataset.timing.split(',').map(Number);
      controls[2].set(awake); controls[3].set(asleep); update();
    }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      defaults.forEach((value, i) => controls[i].set(value)); update();
    });
    update();
  }

  function init() {
    document.querySelectorAll('[data-demo="rgb"], [data-demo="sleep"]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'rgb') initRGB(root);
      else initSleep(root);
      const button = root.querySelector('[data-fullscreen]');
      if (document.fullscreenEnabled && root.requestFullscreen) {
        button.hidden = false;
        button.addEventListener('click', async () => {
          try {
            if (document.fullscreenElement === root) await document.exitFullscreen();
            else await root.requestFullscreen();
          } catch (_) { /* Continue to offer the inline demo if fullscreen is unavailable. */ }
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
