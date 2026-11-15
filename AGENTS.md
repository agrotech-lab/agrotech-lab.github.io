# AGENTS.md — agrotech-lab.github.io

This is a [Quarto](https://quarto.org) **book** project: the course website for
an agrotech electronics/IoT class (ESP32 / DFRobot FireBeetle boards). Content
is authored as `.qmd` files and rendered to static HTML.

## Build & preview

- `quarto preview` — live-reloading local preview. If one is already running
  in the background (check `ps aux | grep quarto`), don't start a second one;
  it rebuilds `docs/` and `.quarto/` automatically as source files change.
- `quarto render` — one-shot build.
- **Output directory is `docs/`** (set by `project.output-dir` in
  `_quarto.yml`), published via GitHub Pages directly from `docs/` on `main`.
  Never hand-edit files under `docs/` — they're regenerated.
- `_site/` is a **stale leftover** from before the project switched to
  `output-dir: docs`. It is tracked in git but not rebuilt or published.
  Don't confuse it with `docs/`; don't bother fixing it.
- The chapter list / sidebar structure lives in `_quarto.yml` under
  `book.chapters`. A new tutorial/assignment page must be added there or it
  won't appear in the nav even if the `.qmd` file exists.

## Repo layout

- `tutorials/`, `assignments/`, `projects/` — the book's content chapters.
- `archive/` — static assets referenced by content:
  - `archive/code/` — `.ino` / `.py` source files shown in pages via
    `code_source()` (see below).
  - `archive/figures/` — images and diagrams (`archive/figures/diagrams/`
    for circuit schematics).
  - `archive/teaching-material/`, `archive/papers/`, `archive/images/`,
    `archive/logo/` — other static assets.
  - `archive/agent-notes/` — notes written by coding agents for coding
    agents (how-tos, gotchas discovered the hard way). Check here before
    redoing something that's probably been figured out before; add to it
    when you learn something non-obvious that isn't in the code itself.
- `_includes/` — small reusable `.qmd` snippets (interactive demos) pulled
  into chapters with `{{< include ... >}}`.
- `_examples/` — a standalone PlatformIO example project (not rendered by
  Quarto), referenced by the VS Code / PlatformIO tutorial.
- `_teaching-notes/` — maintainer-only planning notes. **Not a book
  chapter** — don't add these files to `_quarto.yml`, and don't put
  private student information in them even though they live in the repo.
- `_insert_ino_code.qmd` — defines the `code_source(filename)` Python
  helper (reads a file from `archive/code/`, renders a toggle button +
  download link + syntax-highlighted code block). Any page that calls
  `code_source(...)` must `{{< include ../_insert_ino_code.qmd >}}` near
  the top **and** keep `jupyter: python3` in its YAML frontmatter.

## `jupyter: python3` frontmatter

Only add this to a `.qmd` file if it actually has an executable
` ```{python} ` chunk (including indirectly, via including
`_insert_ino_code.qmd` and calling `code_source()`). A fenced block like
` ```{.python} ` (dot prefix) is just syntax highlighting, not execution —
it does not need `jupyter: python3`. The line costs real render/preview
time (spins up a Jupyter kernel) for every page that doesn't need it, so
don't add it defensively — check whether the page has a real executable
chunk first.

## Circuit diagrams

See `archive/agent-notes/circuit-diagrams.md` before building or editing
any circuit schematic. Short version: use Python's `schemdraw` library
rather than hand-coding SVG coordinates or relying on Fritzing exports —
but there are several non-obvious API gotchas documented there that will
otherwise cost a lot of trial and error.

## Conventions

- Some `.qmd` files have CRLF line endings (Windows-authored). Don't
  assume `\n`-only line endings in scripted edits (e.g. a `sed` pattern
  anchored on `$` needs to account for a trailing `\r`); check with
  `grep -n ... | xxd` if a line-oriented edit doesn't seem to match.
- This is a live teaching site; be conservative with destructive edits to
  existing tutorial content students may be mid-course following.
