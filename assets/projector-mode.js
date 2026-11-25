/* Shared classroom blackout. No navigation, saved state, or dependencies. */
(() => {
  'use strict';
  const toggle = document.getElementById('projector-blackout-toggle');
  const screen = document.getElementById('projector-blackout');
  const back = document.getElementById('projector-blackout-return');
  const hint = document.getElementById('projector-blackout-hint');
  if (!toggle || !screen || typeof screen.showModal !== 'function') return;

  let active = false;
  let enteredFullscreen = false;
  let previousFocus;
  let scrollPosition;
  let hintTimer;
  let generation = 0;

  function restorePosition() {
    if (active) return;
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll: true});
    if (scrollPosition) window.scrollTo({...scrollPosition, behavior: 'instant'});
  }

  function leave() {
    if (!active) return;
    active = false;
    const token = ++generation;
    clearTimeout(hintTimer);
    screen.close();
    document.documentElement.classList.remove('projector-is-black');
    const exitOurFullscreen = enteredFullscreen && document.fullscreenElement === document.documentElement;
    enteredFullscreen = false;
    restorePosition();
    // Only leave fullscreen that this control started. A previously enlarged
    // teaching demo stays enlarged when the instructor clicks to return.
    if (exitOurFullscreen) {
      document.exitFullscreen().catch(() => {}).finally(() => {
        if (token === generation) requestAnimationFrame(restorePosition);
      });
    } else {
      requestAnimationFrame(() => { if (token === generation) restorePosition(); });
    }
  }

  function enter() {
    if (active) return;
    active = true;
    ++generation;
    previousFocus = document.activeElement;
    scrollPosition = {left: window.scrollX, top: window.scrollY};
    enteredFullscreen = false;
    document.documentElement.classList.add('projector-is-black');
    screen.showModal();
    back.focus({preventScroll: true});
    hint.hidden = false;
    hintTimer = setTimeout(() => { hint.hidden = true; }, 2000);

    // Fullscreen needs a user gesture and can be refused. The modal still
    // covers the entire webpage if the browser cannot hide its own chrome.
    if (!document.fullscreenElement && document.fullscreenEnabled && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen({navigationUI: 'hide'}).then(() => {
        if (active && document.fullscreenElement === document.documentElement) {
          enteredFullscreen = true;
        } else if (!active && document.fullscreenElement === document.documentElement) {
          // A quick exit may happen before the fullscreen promise resolves.
          document.exitFullscreen().catch(() => {}).finally(restorePosition);
        }
      }).catch(() => {});
    }
  }

  toggle.addEventListener('click', enter);
  back.addEventListener('click', leave);
  screen.addEventListener('cancel', event => { event.preventDefault(); leave(); });
  document.addEventListener('fullscreenchange', () => {
    // Browsers can consume Escape before dispatching a key event to the page.
    if (active && !document.fullscreenElement) leave();
  });
  document.addEventListener('keydown', event => {
    if (event.isComposing) return;
    const shortcut = event.code === 'KeyB' && event.altKey && event.shiftKey && !event.ctrlKey && !event.metaKey;
    if (active) {
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter' || shortcut) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (!event.repeat) leave();
      }
      return;
    }
    const target = event.target;
    if (!shortcut || event.repeat || event.defaultPrevented || !(target instanceof Element) || target.isContentEditable ||
        target.closest('input, textarea, select, [role="textbox"], [role="slider"]')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    enter();
  }, true);
  // Returning through the browser's back/forward cache must not strand a
  // page behind its blackout. A normal reload also always starts visible.
  window.addEventListener('pagehide', leave);
  toggle.hidden = false;
})();
