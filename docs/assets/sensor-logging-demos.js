(() => {
  'use strict';
  const find = (root, id) => root.querySelector(`#${id}`);
  const text = (node, value) => { if (node.textContent !== String(value)) node.textContent = value; };
  const fixed = (value, places = 2) => value.toFixed(places);
  const svg = (tag, attributes, content) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (content !== undefined) node.textContent = content;
    return node;
  };
  function number(root, id, update) {
    const input = find(root, id);
    let value = input.valueAsNumber;
    const set = v => {
      value = +(+input.min + Math.round((Math.max(+input.min, Math.min(+input.max, v)) - +input.min) / +input.step + 1e-9) * +input.step).toFixed(8);
      input.value = value; input.removeAttribute('aria-invalid');
    };
    input.addEventListener('input', () => {
      if (!input.validity.valid || !Number.isFinite(input.valueAsNumber)) { input.setAttribute('aria-invalid', 'true'); return; }
      value = input.valueAsNumber; input.removeAttribute('aria-invalid'); update();
    });
    input.addEventListener('change', () => { set(Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : value); update(); });
    return { get value() { return value; }, set };
  }
  function pair(root, id, update, unit) {
    const range = find(root, id);
    const field = number(root, `${id}-number`, () => { range.value = field.value; announce(); update(); });
    function announce() { range.setAttribute('aria-valuetext', `${field.value} ${unit}`); }
    range.addEventListener('input', () => { field.set(+range.value); announce(); update(); });
    announce();
    return { get value() { return field.value; }, set(v) { field.set(v); range.value = field.value; announce(); } };
  }
  function i2c(root) {
    const get = name => find(root, `i2c-${name}`), set = (name, value) => text(get(name), value);
    const devices = [
      { id: 'a', name: 'SHT31 A', x: 195, reading: '24.0°C, 60% humidity' },
      { id: 'b', name: 'SHT31 B', x: 365, reading: '25.5°C, 53% humidity' },
      { id: 'distance', name: 'VL53L0X', x: 535, reading: '320 mm' }
    ];
    let asked = false, scanned = false;
    const connected = device => get(`connected-${device.id}`).checked;
    const address = device => device.id === 'distance' ? '0x29' : get(`address-${device.id}`).value;
    function update() {
      const active = devices.filter(connected), target = get('target').value;
      const replies = active.filter(device => address(device) === target);
      const addresses = [...new Set(active.map(address))].sort();
      const shared = addresses.filter(value => active.filter(device => address(device) === value).length > 1);
      get('warning').hidden = !shared.length;
      set('warning', shared.length ? `Both SHT31 sensors use ${shared[0]}. Give them different addresses to select them separately.` : '');
      for (const device of devices) if (device.id !== 'distance') get(`address-${device.id}`).disabled = !connected(device);
      set('found', scanned ? (addresses.length ? addresses.join(', ') : 'No addresses found.') : 'Not scanned yet.');
      const status = get('status');
      status.dataset.state = !asked ? 'ready' : replies.length === 1 ? 'success' : 'problem';
      set('status', !asked ? 'Choose an address and press Ask sensor.' : !replies.length ? `No sensor answers at ${target}.` : replies.length > 1 ? `Two sensors answer at ${target}. Give them different addresses to select just one.` : `${replies[0].name} answers at ${target}. Example: ${replies[0].reading}.`);
      set('description', `${active.length} connected sensors. ${active.map(device => `${device.name} at ${address(device)}`).join('; ')}. ${status.textContent}`);
      draw(replies, target);
    }
    function draw(replies, target) {
      const wires = get('wires'), nodes = get('nodes'); wires.replaceChildren(); nodes.replaceChildren();
      const blue = '#17649a', orange = '#a9580a';
      const line = (path, color, width = 3) => svg('path', { d: path, stroke: color, 'stroke-width': width, fill: 'none' });
      wires.append(line('M140,155H685', blue), line('M140,205H685', orange));
      wires.append(svg('text', { x: 145, y: 145, class: 'i2c-small' }, 'SDA'), svg('text', { x: 145, y: 235, class: 'i2c-small' }, 'SCL'));
      const controller = svg('g', { class: 'i2c-node' });
      controller.append(svg('rect', { x: 15, y: 125, width: 125, height: 100, rx: 8 }), svg('text', { x: 77, y: 165, 'text-anchor': 'middle', class: 'i2c-label' }, 'ESP32'), svg('text', { x: 77, y: 195, 'text-anchor': 'middle', class: 'i2c-small' }, `To ${target}`));
      nodes.append(controller);
      for (const device of devices) {
        const on = connected(device), selected = asked && replies.includes(device), x = device.x;
        if (on) {
          wires.append(line(`M${x + 30},105V155`, blue));
          // The white underlay marks the SCL crossing without an SDA junction.
          wires.append(line(`M${x + 105},105V205`, '#fff', 9), line(`M${x + 105},105V205`, orange));
          wires.append(svg('circle', { cx: x + 30, cy: 155, r: 4, fill: blue }), svg('circle', { cx: x + 105, cy: 205, r: 4, fill: orange }));
        }
        const group = svg('g', { class: 'i2c-node', 'data-sensor': device.id, 'data-state': !on ? 'off' : selected ? replies.length > 1 ? 'problem' : 'selected' : 'ready' });
        group.append(svg('rect', { x, y: 25, width: 150, height: 80, rx: 8 }), svg('text', { x: x + 75, y: 53, 'text-anchor': 'middle', class: 'i2c-label' }, device.name), svg('text', { x: x + 75, y: 82, 'text-anchor': 'middle' }, on ? address(device) : 'Disconnected'));
        nodes.append(group);
      }
    }
    get('ask').addEventListener('click', () => { asked = true; update(); });
    get('scan').addEventListener('click', () => { scanned = true; update(); });
    get('target').addEventListener('change', () => { asked = false; update(); });
    devices.forEach(device => {
      get(`connected-${device.id}`).addEventListener('change', () => { asked = false; scanned = false; update(); });
      if (device.id !== 'distance') get(`address-${device.id}`).addEventListener('change', () => { asked = false; scanned = false; update(); });
    });
    root.querySelector('[data-reset]').addEventListener('click', () => {
      devices.forEach(device => { get(`connected-${device.id}`).checked = true; });
      get('address-a').value = '0x44'; get('address-b').value = '0x45'; get('target').value = '0x44'; asked = false; scanned = false; update();
    });
    update();
  }
  function logging(root) {
    const get = name => find(root, `logging-${name}`), set = (name, value) => text(get(name), value);
    const interval = pair(root, 'logging-interval', update, 'seconds');
    const start = pair(root, 'logging-start', update, 'seconds');
    const temperature = seconds => 24 + 10 * Math.max(0, 1 - Math.abs(seconds - 150) / 15);
    function update() {
      for (const suffix of ['', '-number']) {
        get(`start${suffix}`).max = interval.value - 1;
        get(`start${suffix}`).disabled = interval.value === 1;
      }
      start.set(Math.min(start.value, interval.value - 1));
      const readings = [];
      for (let t = start.value; t <= 300; t += interval.value) readings.push({ t, value: temperature(t) });
      const highest = Math.max(...readings.map(point => point.value));
      set('count', readings.length); set('highest', `${fixed(highest, 1)}°C`);
      set('times', `Readings at ${readings.slice(0, 3).map(point => point.t).join(', ')}… seconds. Last reading: ${readings.at(-1).t} s.`);
      get('status').dataset.state = highest === 34 ? 'success' : 'problem';
      set('status', highest === 34 ? 'The saved readings catch the highest temperature.' : highest === 24 ? 'The saved readings miss the warm spell completely.' : `The highest saved reading is ${fixed(34 - highest, 1)}°C below the example peak.`);
      set('description', `${readings.length} readings saved every ${interval.value} seconds, starting at ${start.value} seconds. Highest saved temperature ${fixed(highest, 1)} degrees Celsius; example peak 34 degrees Celsius. ${get('status').textContent}`);
      const axes = get('axes'), points = get('points'); axes.replaceChildren(); points.replaceChildren();
      const px = t => 75 + t / 300 * 525, py = value => 255 - (value - 22) / 14 * 215;
      const label = (x, y, value, attributes = {}) => axes.append(svg('text', { x, y, ...attributes }, value));
      [24, 28, 32, 36].forEach(value => { const y = py(value); axes.append(svg('line', { x1: 75, x2: 600, y1: y, y2: y, class: 'demo-gridline' })); label(65, y + 6, value, { 'text-anchor': 'end' }); });
      [0, 60, 120, 180, 240, 300].forEach(t => label(px(t), 283, t, { 'text-anchor': 'middle' }));
      label(75, 25, 'Temperature (°C)'); label(337, 318, 'Time (seconds)', { 'text-anchor': 'middle' });
      const path = values => values.map((point, i) => `${i ? 'L' : 'M'}${px(point.t)},${py(point.value)}`).join(' ');
      get('temperature').setAttribute('d', path([0, 135, 150, 165, 300].map(t => ({ t, value: temperature(t) }))));
      get('saved-line').setAttribute('d', path(readings));
      readings.forEach(point => points.append(svg('circle', { cx: px(point.t), cy: py(point.value), r: readings.length > 80 ? 2 : 4, class: 'logging-point' })));
    }
    root.querySelector('[data-reset]').addEventListener('click', () => { interval.set(30); start.set(0); update(); });
    update();
  }
  function start() {
    document.querySelectorAll('[data-demo=i2c-addresses], [data-demo=logging-interval]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'i2c-addresses') i2c(root); else logging(root);
      const button = root.querySelector('[data-fullscreen]');
      if (document.fullscreenEnabled && root.requestFullscreen) {
        button.hidden = false;
        button.addEventListener('click', async () => {
          try { if (document.fullscreenElement === root) await document.exitFullscreen(); else await root.requestFullscreen(); }
          catch (_) { /* Inline controls remain available. */ }
        });
        document.addEventListener('fullscreenchange', () => { button.textContent = document.fullscreenElement === root ? 'Exit enlarged view' : 'Enlarge demo'; });
      }
      root.dataset.ready = 'true';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
