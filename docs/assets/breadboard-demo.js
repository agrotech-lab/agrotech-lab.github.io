(() => {
  'use strict';
  function init(root) {
    if (root.dataset.ready) return;
    const el = name => root.querySelector(`#breadboard-${name}`);
    const mode = el('mode'), split = el('split'), metal = el('metal');
    const columns = ['L+', 'L-', ...'abcdefghij', 'R+', 'R-'];
    const xs = [48, 84, 156, 192, 228, 264, 300, 396, 432, 468, 504, 540, 612, 648];
    const colours = ['#7b46a6', '#cc5b17', '#2456b2', '#a42e64', '#14796c', '#705f21'];
    const holes = new Map();
    let wires = [], nextWire = 1, selected = 'a3', pending = null, probes = [];
    const svgNode = (tag, attributes, text) => {
      const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
      if (text !== undefined) node.textContent = text;
      return node;
    };
    const y = row => 100 + (row - 1) * 32 + (row > 5 ? 16 : 0);
    const railName = column => `${column[0] === 'L' ? 'Left' : 'Right'} ${column[1] === '+' ? '+' : '−'} rail`;
    for (let row = 1; row <= 10; row++) {
      columns.forEach((column, ci) => {
        const id = `${column}${row}`, button = document.createElement('button');
        button.type = 'button'; button.className = 'bb-hole'; button.dataset.hole = id;
        button.style.left = `${xs[ci] / 696 * 100}%`; button.style.top = `${y(row) / 484 * 100}%`;
        button.tabIndex = id === selected ? 0 : -1;
        const label = column.length === 1 ? id : `${railName(column)}, row ${row}`;
        holes.set(id, { id, column, row, ci, x: xs[ci], y: y(row), label, button });
        el('holes').append(button);
        button.addEventListener('click', () => { focusHole(id, false); choose(id); });
        button.addEventListener('keydown', event => {
          let target;
          if (event.key === 'ArrowLeft') target = `${columns[Math.max(0, ci - 1)]}${row}`;
          if (event.key === 'ArrowRight') target = `${columns[Math.min(columns.length - 1, ci + 1)]}${row}`;
          if (event.key === 'ArrowUp') target = `${column}${Math.max(1, row - 1)}`;
          if (event.key === 'ArrowDown') target = `${column}${Math.min(10, row + 1)}`;
          if (event.key === 'Home') target = `L+${row}`;
          if (event.key === 'End') target = `R-${row}`;
          if (target) { event.preventDefault(); focusHole(target, true); }
        });
      });
    }
    function focusHole(id, focus) {
      holes.forEach(hole => { hole.button.tabIndex = hole.id === id ? 0 : -1; });
      if (focus) holes.get(id).button.focus({ preventScroll: true });
      if (focus) holes.get(id).button.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
    // Built-in strips are graph vertices. Jumpers are edges between strips;
    // neither geometric wire crossings nor adjacent holes create edges.
    function group(hole) {
      if (hole.column.length === 1) return `${hole.ci < 7 ? 'left' : 'right'}-${hole.row}`;
      return `${hole.column}-${split.checked && hole.row > 5 ? 'lower' : 'upper'}`;
    }
    function topology() {
      const groups = new Map(), parent = new Map();
      holes.forEach(hole => {
        const key = group(hole);
        if (!groups.has(key)) { groups.set(key, []); parent.set(key, key); }
        groups.get(key).push(hole);
      });
      const find = key => {
        if (parent.get(key) !== key) parent.set(key, find(parent.get(key)));
        return parent.get(key);
      };
      wires.forEach(wire => parent.set(find(group(holes.get(wire.a))), find(group(holes.get(wire.b)))));
      const connected = (a, b) => find(group(holes.get(a))) === find(group(holes.get(b)));
      return { groups, connected };
    }
    function markings() {
      const layer = el('markings'); layer.replaceChildren();
      const text = (x, yy, value, cls = '') => layer.append(svgNode('text', { x, y: yy, class: cls }, value));
      text(66, 30, 'Left rails'); text(630, 30, 'Right rails');
      text(348, 30, 'Terminal strips'); text(348, 466, 'Centre gap');
      text(228, 443, 'a–e', 'bb-small-label'); text(468, 443, 'f–j', 'bb-small-label');
      columns.forEach((col, ci) => {
        if (col.length === 1) text(xs[ci], 65, col);
        else {
          const cls = col[1] === '+' ? 'bb-rail-positive' : 'bb-rail-negative';
          text(xs[ci], 65, col[1] === '+' ? '+' : '−', cls);
          const ranges = split.checked ? [[86, 240], [264, 418]] : [[86, 418]];
          ranges.forEach(([start, end]) => layer.append(svgNode('line', { x1: xs[ci] - 14, x2: xs[ci] - 14, y1: start, y2: end, class: cls })));
        }
      });
      for (let row = 1; row <= 10; row++) { text(126, y(row) + 6, row); text(570, y(row) + 6, row); }
      if (split.checked) { text(66, 257, 'break', 'bb-small-label'); text(630, 257, 'break', 'bb-small-label'); }
    }
    const occupied = id => wires.some(wire => wire.a === id || wire.b === id);
    function update(message = '') {
      const graph = topology(), net = [...holes.values()].filter(hole => graph.connected(selected, hole.id));
      const tested = probes.length === 2, connected = tested && graph.connected(...probes);
      holes.forEach(hole => {
        const inNet = graph.connected(selected, hole.id), used = occupied(hole.id), probeIndex = probes.indexOf(hole.id);
        hole.button.classList.toggle('is-connected', inNet);
        hole.button.classList.toggle('is-selected', hole.id === selected);
        hole.button.classList.toggle('is-occupied', used);
        if (probeIndex >= 0) hole.button.dataset.probe = probeIndex === 0 ? 'A' : 'B'; else delete hole.button.dataset.probe;
        hole.button.setAttribute('aria-label', `${hole.label}${hole.id === selected ? ', selected' : ''}${inNet ? ', in highlighted group' : ''}${used ? ', jumper attached' : ''}${probeIndex >= 0 ? `, probe ${probeIndex === 0 ? 'A' : 'B'}` : ''}`);
        hole.button.title = hole.button.getAttribute('aria-label');
      });
      const strips = el('strips'); strips.replaceChildren();
      graph.groups.forEach(members => {
        const first = members[0], last = members[members.length - 1], inNet = graph.connected(selected, first.id);
        if (metal.checked || inNet) strips.append(svgNode('line', { x1: first.x, y1: first.y, x2: last.x, y2: last.y, class: `bb-strip${inNet ? ' is-connected' : ''}` }));
      });
      el('result').textContent = tested ? `${connected ? 'Connected' : 'No connection'} · ${probes[0]} ↔ ${probes[1]}` : `${selected} · ${net.length} connected holes`;
      root.querySelector('.breadboard-reading').dataset.state = tested && !connected ? 'open' : 'connected';
      const groupNames = [...graph.groups.values()].filter(members => graph.connected(selected, members[0].id)).map(members => `${members[0].id}–${members[members.length - 1].id}`);
      el('detail').textContent = tested ? (connected ? 'There is a continuous metal path between the probes.' : 'There is no metal path between the probes.') + ` Highlighted group: ${net.length} holes.` : `Connected: ${groupNames.join(', ')}. Includes the selected hole.`;
      el('action').textContent = message;
      el('instruction').textContent = mode.value === 'inspect' ? 'Choose a hole to highlight its connected group.' : pending ? `First endpoint: ${pending}. Choose the second hole.` : mode.value === 'wire' ? 'Choose two free holes to add a jumper.' : 'Choose two holes to test for continuity.';
      el('cancel').hidden = pending === null;
      markings();
    }
    function renderWires() {
      const layer = el('wires'), list = el('wire-list'); layer.replaceChildren(); list.replaceChildren();
      wires.forEach(wire => {
        const a = holes.get(wire.a), b = holes.get(wire.b), lift = 24 + (wire.id % 3) * 8;
        const d = `M${a.x},${a.y} C${a.x},${a.y - lift} ${b.x},${b.y - lift} ${b.x},${b.y}`;
        const colour = colours[(wire.id - 1) % colours.length];
        layer.append(svgNode('path', { d, class: 'bb-jumper', stroke: '#fcfcf7', 'stroke-width': 9 }));
        layer.append(svgNode('path', { d, class: 'bb-jumper', stroke: colour, 'stroke-width': 5 }));
        const li = document.createElement('li'), entry = document.createElement('div'), swatch = document.createElement('i');
        entry.className = 'bb-wire-entry'; swatch.style.backgroundColor = colour; swatch.setAttribute('aria-hidden', 'true');
        const label = document.createElement('span'); label.textContent = `${wire.a} ↔ ${wire.b}`;
        const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.dataset.removeWire = wire.id;
        remove.setAttribute('aria-label', `Remove jumper ${wire.a} to ${wire.b}`);
        remove.addEventListener('click', () => {
          const index = wires.indexOf(wire); wires = wires.filter(item => item !== wire);
          renderWires(); update(`Removed jumper ${wire.a} ↔ ${wire.b}.`);
          const buttons = list.querySelectorAll('button');
          (buttons[Math.min(index, buttons.length - 1)] || mode).focus();
        });
        entry.append(swatch, label, remove); li.append(entry); list.append(li);
      });
      el('wire-count').textContent = `(${wires.length})`;
      el('empty').hidden = wires.length > 0; el('clear').disabled = wires.length === 0;
    }
    function choose(id) {
      if (mode.value === 'inspect') { selected = id; update(); return; }
      if (mode.value === 'wire') {
        if (wires.length >= 12) { update('This teaching board allows 12 jumpers. Remove one to add another.'); return; }
        if (occupied(id)) { update(`${id} already holds a jumper. Choose another hole in that group.`); return; }
        if (pending === id) { update('Choose a different hole for the second end, or cancel.'); return; }
        if (pending === null) { pending = id; selected = id; update(); return; }
        const first = pending, alreadyConnected = topology().connected(first, id);
        wires.push({ id: nextWire++, a: first, b: id }); pending = null;
        renderWires(); update(`Added jumper ${first} ↔ ${id}.${alreadyConnected ? ' These holes were already connected, so the jumper adds no new connection.' : ''}`);
        return;
      }
      if (pending === null) { pending = id; selected = id; probes = [id]; }
      else if (pending === id) { update('Choose a different hole for probe B, or cancel.'); return; }
      else { probes = [pending, id]; pending = null; }
      update();
    }
    function cancel() { pending = null; probes = []; update('First endpoint cancelled.'); }
    el('cancel').addEventListener('click', () => { cancel(); mode.focus(); });
    root.addEventListener('keydown', event => { if (event.key === 'Escape' && pending) { event.preventDefault(); cancel(); } });
    mode.addEventListener('change', () => { pending = null; probes = []; update(); });
    split.addEventListener('change', () => update('Rail layout changed; jumpers remain in place.'));
    metal.addEventListener('change', () => update(metal.checked ? 'All metal strips shown.' : 'Only the selected group is revealed.'));
    el('clear').addEventListener('click', () => { wires = []; pending = null; if (probes.length === 1) probes = []; renderWires(); update('All jumper wires removed.'); mode.focus(); });
    function reset(example) {
      wires = []; nextWire = 1; selected = 'a3'; pending = null; probes = [];
      split.checked = true; metal.checked = true; mode.value = example ? 'test' : 'inspect';
      if (example === 'row') probes = ['a3', 'e3'];
      if (example === 'gap' || example === 'bridge') probes = ['a3', 'j3'];
      if (example === 'bridge') wires = [{ id: nextWire++, a: 'e3', b: 'f3' }];
      if (example === 'rail') { selected = 'L+2'; probes = ['L+2', 'L+9']; }
      el('board').parentElement.scrollLeft = 0;
      focusHole(selected, false); renderWires(); update();
    }
    root.querySelectorAll('[data-breadboard-example]').forEach(button => button.addEventListener('click', () => reset(button.dataset.breadboardExample)));
    root.querySelector('[data-reset]').addEventListener('click', () => reset());
    const fullscreen = root.querySelector('[data-fullscreen]');
    if (document.fullscreenEnabled && root.requestFullscreen) {
      fullscreen.hidden = false;
      fullscreen.addEventListener('click', async () => {
        try { if (document.fullscreenElement === root) await document.exitFullscreen(); else await root.requestFullscreen(); }
        catch (_) { /* Inline controls remain usable if fullscreen is unavailable. */ }
      });
      document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement === root ? 'Exit enlarged view' : 'Enlarge demo'; });
    }
    reset();
    root.querySelector('.breadboard-workbench').hidden = false;
    root.querySelector('.breadboard-examples').hidden = false;
    root.querySelector('[data-reset]').hidden = false;
    root.dataset.ready = 'true';
  }
  const start = () => document.querySelectorAll('[data-demo=breadboard]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
