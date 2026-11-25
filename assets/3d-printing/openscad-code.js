// A small, display-only lexer. Text nodes preserve the source exactly and
// keep comments/strings as text, never HTML. This does not execute OpenSCAD.
const keywords = new Set(['module', 'function', 'if', 'else', 'for', 'intersection_for', 'let', 'each', 'assert', 'echo', 'true', 'false', 'undef']);
const tokens = /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|"(?:\\[\s\S]|[^"\\])*"|(?:\b\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|\$?[a-zA-Z_]\w*/g;

export function renderOpenSCAD(element, source) {
  const fragment = document.createDocumentFragment(), lines = [];
  let line;
  function nextLine() {
    line = document.createElement('span');
    line.dataset.line = lines.length + 1;
    lines.push(line);
    fragment.append(line);
  }
  function append(text, type) {
    text.split('\n').forEach((part, index) => {
      if (index) { fragment.append(document.createTextNode('\n')); nextLine(); }
      if (!part) return;
      if (type) {
        const span = document.createElement('span');
        span.className = `scad-${type}`;
        span.textContent = part;
        line.append(span);
      } else line.append(document.createTextNode(part));
    });
  }
  nextLine();
  let offset = 0;
  for (const match of source.matchAll(tokens)) {
    append(source.slice(offset, match.index));
    const token = match[0];
    const type = token.startsWith('//') || token.startsWith('/*') ? 'comment'
      : token.startsWith('"') ? 'string'
      : /^[\d.]/.test(token) ? 'number'
      : keywords.has(token) ? 'keyword'
      : /^\s*\(/.test(source.slice(match.index + token.length)) ? 'function'
      : null;
    append(token, type);
    offset = match.index + token.length;
  }
  append(source.slice(offset));
  element.replaceChildren(fragment);
  return lines;
}
