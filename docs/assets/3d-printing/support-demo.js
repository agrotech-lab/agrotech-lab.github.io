/* Side-view teaching diagram, matched to support-bracket.scad; not a slicer. */
(() => {
  'use strict';
  const root = document.getElementById('support-explorer');
  if (!root) return;
  const q = selector => root.querySelector(selector);
  const slider = q('#support-build-height');
  const upright = 'M150 360 V80 H510 V120 H190 V360 Z';
  const turned = 'M150 360 V80 H190 V320 H510 V360 Z';
  let mode = 'none';

  function render() {
    const height = Number(slider.value), y = 360 - height * 10;
    const path = mode === 'turned' ? turned : upright;
    for (const selector of ['[data-part-outline]', '[data-part-fill]', '[data-part-layer-lines]']) q(selector).setAttribute('d', path);
    q('[data-scaffold]').setAttribute('visibility', mode === 'supported' ? 'visible' : 'hidden');
    q('[data-scaffold]').removeAttribute('hidden');
    q('[data-overhang-marker]').setAttribute('visibility', mode === 'none' ? 'visible' : 'hidden');
    q('[data-build-clip]').setAttribute('y', y);
    q('[data-build-clip]').setAttribute('height', height * 10);
    q('[data-build-output]').textContent = `${height} mm`;
    q('[data-build-label]').textContent = `${height} mm`;
    q('[data-build-label]').setAttribute('y', y - 7);
    q('[data-build-line]').setAttribute('y1', y);
    q('[data-build-line]').setAttribute('y2', y);
    const label = {none: 'Upright: a long overhang', supported: 'Upright: removable supports below', turned: 'Turned over: the broad face is on the plate'}[mode];
    q('[data-support-view-label]').textContent = label;
    let message;
    if (mode === 'turned') message = 'The same bracket is turned over. Its broad face starts on the plate, and the wall grows upward: this orientation needs no supports.';
    else if (mode === 'supported') message = 'The supports grow from the plate before the ledge is printed. They hold it up during printing and are removed afterwards.';
    else message = height < 24
      ? 'So far, only the wall is growing. When the build reaches 24 mm, the next layers extend sideways over empty space.'
      : 'At 24 mm, the ledge starts over empty space. This long overhang can sag or fail without support.';
    q('[data-support-status]').textContent = message;
    q('#support-svg-desc').textContent = `${label}. Build shown up to ${height} mm. ${message}`;
    for (const button of root.querySelectorAll('[data-support-mode]')) button.setAttribute('aria-pressed', String(button.dataset.supportMode === mode));
    root.dataset.mode = mode;
    root.dataset.height = String(height);
  }

  for (const button of root.querySelectorAll('[data-support-mode]')) button.addEventListener('click', () => { mode = button.dataset.supportMode; render(); });
  slider.addEventListener('input', render);
  q('[data-support-reset]').addEventListener('click', () => { mode = 'none'; slider.value = '28'; render(); });
  for (const controls of root.querySelectorAll('[data-support-controls], [data-build-line], [data-build-label]')) controls.removeAttribute('hidden');
  const fullscreen = q('[data-support-fullscreen]');
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement === root) await document.exitFullscreen();
      else await root.requestFullscreen();
    } catch { q('[data-support-status]').textContent = 'Full screen is unavailable. The diagram controls still work here.'; }
  });
  document.addEventListener('fullscreenchange', () => { fullscreen.textContent = document.fullscreenElement === root ? 'Exit full screen' : 'Full screen'; });
  render();
  root.dataset.ready = 'true';
})();
