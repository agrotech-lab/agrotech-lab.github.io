(() => {
  'use strict';
  const fixed = (value, digits = 1) => (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toFixed(digits);
  const el = (root, id) => root.querySelector(`#${id}`);
  const text = (node, value) => { if (node.textContent !== String(value)) node.textContent = value; };
  const svg = (tag, attributes, content) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (content !== undefined) node.textContent = content;
    return node;
  };
  function number(root, id, update) {
    const input = el(root, id);
    let value = input.valueAsNumber;
    const normalize = v => +(+input.min + Math.round((Math.max(+input.min, Math.min(+input.max, v)) - +input.min) / +input.step + 1e-9) * +input.step).toFixed(8);
    const set = v => { value = normalize(v); input.value = value; input.removeAttribute('aria-invalid'); };
    input.addEventListener('input', () => {
      if (!input.validity.valid || !Number.isFinite(input.valueAsNumber)) { input.setAttribute('aria-invalid', 'true'); return; }
      const previous = value; value = input.valueAsNumber; input.removeAttribute('aria-invalid');
      if (value !== previous) update();
    });
    input.addEventListener('change', () => {
      const previous = value; set(Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : value);
      if (value !== previous) update();
    });
    return { get value() { return value; }, set };
  }
  function pair(root, id, update, unit) {
    const range = el(root, id);
    const field = number(root, `${id}-number`, () => { range.value = field.value; announce(); update(); });
    function announce() { range.setAttribute('aria-valuetext', `${field.value} ${unit}`); }
    range.addEventListener('input', () => { const previous = field.value; field.set(+range.value); announce(); if (field.value !== previous) update(); });
    announce();
    return { get value() { return field.value; }, set(v) { field.set(v); range.value = field.value; announce(); } };
  }
  function calibration(root) {
    const get = name => el(root, `calibration-${name}`), set = (name, value) => text(get(name), value);
    const code1 = number(root, 'calibration-code1', update), angle1 = number(root, 'calibration-angle1', update);
    const code2 = number(root, 'calibration-code2', update), angle2 = number(root, 'calibration-angle2', update);
    const reading = pair(root, 'calibration-reading', update, 'ADC counts');
    function update() {
      const x1 = code1.value, x2 = code2.value, a1 = angle1.value, a2 = angle2.value, current = reading.value;
      const valid = x1 !== x2, slope = valid ? (a2 - a1) / (x2 - x1) : 0;
      const intercept = a1 - slope * x1, estimate = slope * current + intercept;
      const outside = current < Math.min(x1, x2) || current > Math.max(x1, x2);
      set('slope', valid ? fixed(slope, 6) : '—'); set('intercept', valid ? `${fixed(intercept, 2)}°` : '—');
      set('estimate', valid ? `${fixed(estimate)}°` : 'Undefined');
      set('formula', valid ? `θ = ${fixed(slope, 6)} × i ${intercept < 0 ? '−' : '+'} ${fixed(Math.abs(intercept), 2)}` : 'A line of the form θ = a × i + b requires two different ADC codes.');
      get('status').dataset.state = !valid ? 'invalid' : outside ? 'outside' : 'inside';
      let status = !valid ? 'Both measured codes are the same. The slope and angle estimate are undefined; enter two different codes.' : outside ? 'Extrapolation: the current code is outside the measured interval. The straight-line assumption is unverified here.' : current === x1 || current === x2 ? 'At a reference point: the estimate matches its known angle.' : 'Interpolation: the current code is between the two measured codes.';
      if (valid && a1 === a2) status += ' Both known angles are equal: this gives a flat line. Use different known angles to calibrate a changing angle.';
      set('status', status);
      set('plot-description', valid ? `Reference 1: code ${x1}, ${a1} degrees. Reference 2: code ${x2}, ${a2} degrees. Current code ${current} estimates ${fixed(estimate)} degrees. ${outside ? 'Extrapolation' : 'Within the reference interval'}.` : 'The reference ADC codes are identical, so the angle conversion is undefined.');
      const values = valid ? [a1, a2, estimate] : [a1, a2];
      const low = Math.min(...values), high = Math.max(...values), padding = Math.max(10, (high - low) * .16);
      const ymin = low - padding, ymax = high + padding;
      const px = x => 85 + x / 4095 * 515, py = v => 285 - (v - ymin) / (ymax - ymin) * 255;
      const axes = get('axes'), lines = get('lines'), markers = get('markers');
      axes.replaceChildren(); lines.replaceChildren(); markers.replaceChildren();
      const label = (x, y, value, attributes = {}) => axes.append(svg('text', { x, y, ...attributes }, value));
      for (let n = 0; n <= 4; n++) {
        const v = ymin + n / 4 * (ymax - ymin), yy = py(v);
        axes.append(svg('line', { x1: 85, x2: 600, y1: yy, y2: yy, class: 'demo-gridline' }));
        label(75, yy + 6, Math.abs(v) >= 1000 ? v.toExponential(0) : fixed(v, 0), { 'text-anchor': 'end' });
      }
      [0, 1024, 2048, 3072, 4095].forEach(v => label(px(v), 313, v, { 'text-anchor': 'middle' }));
      axes.append(svg('path', { d: 'M85,30V285H600', class: 'demo-axis', fill: 'none' }));
      label(342, 347, 'ADC code', { 'text-anchor': 'middle', class: 'sensor-axis-title' });
      label(85, 23, 'Angle (°)', { class: 'sensor-axis-title' });
      if (valid) {
        lines.append(svg('path', { d: `M${px(0)},${py(intercept)}L${px(4095)},${py(slope * 4095 + intercept)}`, class: 'calibration-extension' }));
        lines.append(svg('path', { d: `M${px(x1)},${py(a1)}L${px(x2)},${py(a2)}`, class: 'calibration-fit' }));
        lines.append(svg('path', { d: `M${px(current)},285V${py(estimate)}H85`, class: 'demo-guide', fill: 'none' }));
      }
      [[x1, a1], [x2, a2]].forEach(([x, y], index) => {
        markers.append(svg('circle', { cx: px(x), cy: py(y), r: 7, class: 'calibration-reference' }));
        markers.append(svg('text', { x: px(x), y: py(y) + (index ? 27 : -14), 'text-anchor': 'middle', class: 'sensor-point-label' }, index + 1));
      });
      if (valid) {
        const x = px(current), y = py(estimate);
        markers.append(svg('path', { d: `M${x},${y - 9}l9,9l-9,9l-9,-9Z`, class: 'calibration-current' }));
      }
    }
    function reset(reverse = false) {
      code1.set(reverse ? 3500 : 500); angle1.set(0); code2.set(reverse ? 500 : 3500); angle2.set(90); reading.set(2000); update();
    }
    root.querySelectorAll('[data-calibration-example]').forEach(button => button.addEventListener('click', () => reset(button.dataset.calibrationExample === 'reverse')));
    root.querySelector('[data-calibration-swap]').addEventListener('click', () => {
      const firstCode = code1.value, firstAngle = angle1.value;
      code1.set(code2.value); angle1.set(angle2.value); code2.set(firstCode); angle2.set(firstAngle); update();
    });
    root.querySelector('[data-reset]').addEventListener('click', () => reset());
    update();
  }
  function fanControl(root) {
    const get = name => el(root, `fan-${name}`), set = (name, value) => text(get(name), value);
    const temperature = pair(root, 'fan-temperature', () => { sample(); render(); }, 'degrees Celsius');
    const on = pair(root, 'fan-on', restart, 'degrees Celsius');
    const off = pair(root, 'fan-off', restart, 'degrees Celsius');
    let history = [], running = false, total = 0;
    // Integer tenths keep comparisons exact at the temperatures shown.
    const units = value => Math.round(value * 10);
    function sample() {
      const t = units(temperature.value);
      if (t >= units(on.value)) running = true;
      else if (t <= units(off.value)) running = false;
      history.push({ t: t / 10, running, n: ++total });
      if (history.length > 48) history.shift();
    }
    function bounds(onMin, offMax) {
      for (const suffix of ['', '-number']) {
        get(`on${suffix}`).min = onMin;
        get(`off${suffix}`).max = offMax;
      }
    }
    function restart() {
      bounds(off.value, on.value);
      history = []; total = 0; running = false;
      sample(); render();
    }
    function render() {
      set('state', running ? 'ON' : 'OFF');
      get('card').dataset.state = running ? 'on' : 'off';
      set('rule', on.value === off.value ? `Turn on at ${fixed(on.value)}°C or warmer. Turn off below ${fixed(off.value)}°C.` : `Turn on at ${fixed(on.value)}°C or warmer. Turn off at ${fixed(off.value)}°C or cooler.`);
      set('status', `${fixed(temperature.value)}°C: the fan is ${running ? 'on' : 'off'}.`);
      set('history-note', `Reading ${total}.${total > 48 ? ' Showing the last 48 readings.' : ''}`);
      set('plot-description', `${history.length} displayed readings. Current temperature ${fixed(temperature.value)} degrees Celsius. The fan is ${running ? 'on' : 'off'}. ${get('rule').textContent}`);
      draw();
    }
    function draw() {
      const axes = get('axes'), traces = get('traces'); axes.replaceChildren(); traces.replaceChildren();
      const temps = history.map(point => point.t), ymin = Math.min(off.value - 2, ...temps.map(t => t - 1)), ymax = Math.max(on.value + 2, ...temps.map(t => t + 1));
      const py = t => 190 - (t - ymin) / (ymax - ymin) * 145, cell = 515 / history.length, px = i => 85 + (i + .5) * cell;
      const label = (x, y, value, attributes = {}) => axes.append(svg('text', { x, y, ...attributes }, value));
      axes.append(svg('rect', { x: 85, y: py(on.value), width: 515, height: py(off.value) - py(on.value), class: 'fan-between' }));
      for (let n = 0; n <= 2; n++) {
        const t = ymin + n / 2 * (ymax - ymin), yy = py(t);
        axes.append(svg('line', { x1: 85, x2: 600, y1: yy, y2: yy, class: 'demo-gridline' }));
        label(75, yy + 6, fixed(t), { 'text-anchor': 'end' });
      }
      [on.value, off.value].forEach(t => axes.append(svg('line', { x1: 85, x2: 600, y1: py(t), y2: py(t), class: 'fan-setting' })));
      label(85, 25, 'Temperature (°C)', { class: 'sensor-axis-title' });
      label(75, 258, 'Fan', { 'text-anchor': 'end' });
      axes.append(svg('rect', { x: 85, y: 238, width: 515, height: 25, rx: 3, class: 'fan-track' }));
      history.forEach((point, i) => { if (point.running) traces.append(svg('rect', { x: 85 + i * cell, y: 238, width: cell, height: 25, class: 'fan-on' })); });
      const ticks = [...new Set([0, Math.floor((history.length - 1) / 2), history.length - 1])];
      ticks.forEach(i => label(px(i), 286, history[i].n, { 'text-anchor': 'middle' }));
      label(342, 313, 'Reading number', { 'text-anchor': 'middle', class: 'sensor-axis-title' });
      traces.append(svg('path', { d: history.map((point, i) => `${i ? 'L' : 'M'}${px(i)},${py(point.t)}`).join(' '), class: 'fan-reading' }));
      history.forEach((point, i) => traces.append(svg('circle', { cx: px(i), cy: py(point.t), r: history.length > 24 ? 2 : 4, fill: '#17649a' })));
    }
    get('clear').addEventListener('click', restart);
    root.querySelector('[data-reset]').addEventListener('click', () => {
      bounds(0, 50); temperature.set(27); on.set(30); off.set(28); restart();
    });
    restart();
  }
  function start() {
    document.querySelectorAll('[data-demo=calibration], [data-demo=fan-control]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'calibration') calibration(root); else fanControl(root);
      const button = root.querySelector('[data-fullscreen]');
      if (document.fullscreenEnabled && root.requestFullscreen) {
        button.hidden = false;
        button.addEventListener('click', async () => {
          try { if (document.fullscreenElement === root) await document.exitFullscreen(); else await root.requestFullscreen(); }
          catch (_) { /* Keep inline controls usable if fullscreen is unavailable. */ }
        });
        document.addEventListener('fullscreenchange', () => { button.textContent = document.fullscreenElement === root ? 'Exit enlarged view' : 'Enlarge demo'; });
      }
      root.dataset.ready = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
