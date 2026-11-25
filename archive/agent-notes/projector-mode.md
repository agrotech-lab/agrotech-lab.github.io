# Classroom black screen

`_quarto.yml` includes `_includes/projector-mode.html` after every book page.
The CSS and JavaScript live in `assets/projector-mode.*`; Quarto copies them
and rewrites the root-relative include URLs for nested chapters. Render the
whole book when changing the include. Never edit generated docs/ directly.

The bottom-right button opens a full-viewport, black native dialog. Its
full-size return button supports click/tap and is accessible by keyboard.
Escape, Enter, Space and Alt+Shift+B return to the lesson. Alt+Shift+B also
opens it, except while editing a field or adjusting a slider. The exit hint
hides after two seconds; the mouse cursor and focus outline stay invisible
inside the black area. There is no localStorage, navigation or page reload.

A user gesture requests fullscreen on the document element, because dialog
itself is not a permitted fullscreen element. The modal still works when
fullscreen is denied/unavailable. Browser chrome cannot be hidden in that
fallback. Native dialogs provide the top layer and make underlying controls
inert, including when an enlarged demo is already fullscreen. Clicking to
return leaves that pre-existing fullscreen demo alone. Browser-owned Escape
may only dispatch fullscreenchange, so that event also closes the blackout.
Restore focus with preventScroll, and restore scroll after a fullscreen exit.

References checked at implementation:
- https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen
- https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenchange_event
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal

Verification: test root and nested pages, scroll and slider preservation,
click/touch/Escape/Enter/Space exits, an already-fullscreen demo, denied and
missing fullscreen support, typing guards, reload, no-JS and print. A screen
capture after the hint disappears should be entirely RGB(0,0,0).
