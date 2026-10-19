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
  function pulse(root) {
    const get = name => find(root, `pulse-${name}`), set = (name, value) => text(get(name), value);
    const speed = pair(root, 'pulse-speed', update, 'pulses per second');
    const time = pair(root, 'pulse-time', update, 'seconds');
    const perLitre = number(root, 'pulse-per-litre', update);
    function update() {
      const f = speed.value, seconds = time.value;
      // Both controls use half-unit steps; integer quarters keep end counts exact.
      const count = Math.floor((f * 2) * (seconds * 2) / 4);
      const frequency = count / seconds, litres = count / perLitre.value, flow = litres * 60 / seconds;
      set('count', count); set('frequency', fixed(frequency)); set('flow', fixed(flow, 3));
      set('step', `One extra pulse changes the flow reading by ${fixed(60 / seconds / perLitre.value, 3)} L/min.`);
      set('calculation', `${count} pulses ÷ ${fixed(seconds, 1)} s = ${fixed(frequency)} pulses/s`);
      set('volume', `${count} pulses ÷ ${perLitre.value} pulses/L = ${fixed(litres, 4)} L`);
      set('window', `${fixed(seconds, 1)} seconds`);
      set('plot-description', `${count} pulses counted in ${fixed(seconds, 1)} seconds. Measured rate ${fixed(frequency)} pulses per second. Flow ${fixed(flow, 3)} litres per minute at ${perLitre.value} pulses per litre.`);
      const axes = get('axes'), markers = get('markers'); axes.replaceChildren(); markers.replaceChildren();
      const px = t => 85 + t / seconds * 515;
      const label = (x, y, value, attributes = {}) => axes.append(svg('text', { x, y, ...attributes }, value));
      label(75, 81, 'HIGH', { 'text-anchor': 'end' }); label(75, 161, 'LOW', { 'text-anchor': 'end' });
      [75, 155].forEach(y => axes.append(svg('line', { x1: 85, x2: 600, y1: y, y2: y, class: 'demo-gridline' })));
      [0, .5, 1].forEach(part => { const t = seconds * part; label(px(t), 206, fixed(t, 2), { 'text-anchor': 'middle' }); });
      label(342, 240, 'Time (seconds)', { 'text-anchor': 'middle' });
      let path = 'M85,155';
      for (let n = 1; n <= count; n++) {
        const start = n / f, end = (n + .5) / f, x = px(start);
        path += `H${x}V75H${px(Math.min(end, seconds))}`;
        if (end <= seconds) path += 'V155';
        markers.append(svg('circle', { cx: x, cy: 75, r: count > 40 ? 1.5 : 4, class: 'pulse-dot' }));
        if (count <= 16) markers.append(svg('text', { x, y: 48, 'text-anchor': 'middle', class: 'pulse-number' }, n));
      }
      path += 'H600'; get('wave').setAttribute('d', path);
      get('wave').style.strokeWidth = count > 40 ? 1 : 2.5;
    }
    root.querySelector('[data-reset]').addEventListener('click', () => { speed.set(5); time.set(2); perLitre.set(450); update(); });
    update();
  }
  function mqtt(root) {
    const get = name => find(root, `mqtt-${name}`), set = (name, value) => text(get(name), value);
    const topic = get('topic'), message = get('message');
    const defaults = ['agriculture/field1/temperature', 'agriculture/+/temperature', 'agriculture/#'];
    const screens = defaults.map((filter, index) => ({ id: index + 1, filter: get(`filter-${index + 1}`), count: 0, last: null }));
    let sent = 0;
    function invalid(value, subscription) {
      if (!value.length) return 'Enter a topic.';
      if (value.length > 160) return 'Use up to 160 characters in this demo.';
      if ([...value].some(c => { const n = c.codePointAt(0); return n === 0 || (n >= 0xd800 && n <= 0xdfff); })) return 'Remove the invalid character from this topic.';
      if (!subscription) return /[+#]/.test(value) ? 'Send to a specific topic. Use + and # only in the screens’ Listen to boxes.' : '';
      const parts = value.split('/');
      if (parts.some((part, index) => part.includes('#') && (part !== '#' || index !== parts.length - 1))) return 'Use # by itself after a slash, at the end; or use just #.';
      if (parts.some(part => part.includes('+') && part !== '+')) return 'Use + by itself between slashes, for example agriculture/+/temperature.';
      return '';
    }
    function matches(filter, name) {
      if (name.startsWith('$') && /^[+#]/.test(filter)) return false;
      const f = filter.split('/'), t = name.split('/');
      for (let i = 0; i < f.length; i++) {
        if (f[i] === '#') return true;
        if (i >= t.length || (f[i] !== '+' && f[i] !== t[i])) return false;
      }
      return f.length === t.length;
    }
    function error(input, node, value) {
      text(node, value); node.hidden = !value;
      if (value) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    }
    function preview() {
      const topicError = invalid(topic.value, false);
      error(topic, get('topic-error'), topicError);
      get('send').disabled = !!topicError;
      screens.forEach(screen => {
        const problem = invalid(screen.filter.value, true);
        error(screen.filter, get(`error-${screen.id}`), problem);
        screen.match = !problem && !topicError && matches(screen.filter.value, topic.value);
        get(`card-${screen.id}`).dataset.match = screen.match ? 'yes' : 'no';
        set(`match-${screen.id}`, problem ? 'Check topic' : topicError ? 'Waiting for a topic' : screen.match ? 'Will receive' : 'Will not receive');
      });
    }
    function receipt(screen) {
      set(`last-${screen.id}`, screen.last === null ? 'Nothing yet' : screen.last === '' ? '(empty message)' : screen.last);
      set(`count-${screen.id}`, `${screen.count} ${screen.count === 1 ? 'message' : 'messages'} received`);
    }
    get('form').addEventListener('submit', event => {
      event.preventDefault(); preview();
      if (get('send').disabled) { set('status', 'Check the sending topic before sending.'); return; }
      const recipients = [];
      screens.forEach(screen => {
        if (screen.match) { screen.count++; screen.last = message.value; receipt(screen); recipients.push(`Screen ${screen.id}`); }
        if (!invalid(screen.filter.value, true)) set(`match-${screen.id}`, screen.match ? 'Received' : 'Not sent here');
      });
      sent++;
      set('status', `Message ${sent}: ${recipients.length ? `delivered to ${recipients.join(', ')}.` : 'no screens are listening to this topic.'}`);
    });
    topic.addEventListener('input', () => { preview(); set('status', 'Ready to send to the new topic.'); });
    screens.forEach(screen => screen.filter.addEventListener('input', () => {
      screen.count = 0; screen.last = null; receipt(screen); preview();
      set('status', `Screen ${screen.id} changed. Send a message to try it.`);
    }));
    root.querySelector('[data-reset]').addEventListener('click', () => {
      topic.value = defaults[0]; message.value = '24.5'; sent = 0;
      screens.forEach((screen, index) => { screen.filter.value = defaults[index]; screen.count = 0; screen.last = null; receipt(screen); });
      preview(); set('status', 'Ready to send.');
    });
    preview();
  }
  function start() {
    document.querySelectorAll('[data-demo=pulse-count], [data-demo=mqtt-topics]').forEach(root => {
      if (root.dataset.ready) return;
      if (root.dataset.demo === 'pulse-count') pulse(root); else mqtt(root);
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
