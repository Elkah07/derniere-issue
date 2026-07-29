import test from 'node:test';
import assert from 'node:assert/strict';

test('l’interface principale se rend sans erreur dans un environnement minimal', async () => {
  const classes = new Set();
  const classList = {
    toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
    add(...names) { names.forEach((name) => classes.add(name)); },
    remove(...names) { names.forEach((name) => classes.delete(name)); },
  };
  const app = {
    innerHTML: '', classList,
    insertAdjacentHTML(_position, html) { this.innerHTML += html; },
    querySelector() { return null; },
    addEventListener() {},
  };
  globalThis.document = {
    querySelector(selector) { return selector === '#app' ? app : null; },
    querySelectorAll() { return []; },
    createElement() { return { className: '', setAttribute() {}, innerHTML: '', classList }; },
    body: { className: '', classList, appendChild() {}, offsetWidth: 1 },
    documentElement: { classList },
    addEventListener() {},
    hidden: false,
  };
  globalThis.window = { scrollTo() {}, setTimeout, clearTimeout, setInterval, clearInterval };
  globalThis.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
  Object.defineProperty(globalThis, 'navigator', { value: { vibrate() {} }, configurable: true });
  globalThis.confirm = () => true;
  globalThis.alert = () => {};

  await import(`../src/main.js?smoke=${Date.now()}`);
  assert.match(app.innerHTML, /DERNIÈRE/);
  assert.match(app.innerHTML, /VERSION 0\.8/);
});
