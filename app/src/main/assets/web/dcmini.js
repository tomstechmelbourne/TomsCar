(function() {
  "use strict";
  class DCLogic {
    constructor(props) {
      this.props = props || {};
      this.state = {};
      this.__dirty = false;
    }
    setState(patch) {
      const p = typeof patch === "function" ? patch(this.state) : patch;
      this.state = Object.assign({}, this.state, p);
      if (this.__schedule) this.__schedule();
    }
  }
  window.DCLogic = DCLogic;
  const get = (ctx, path) => {
    path = path.trim();
    if (path === "true") return true;
    if (path === "false") return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    return path.split(".").reduce((o, k) => o == null ? void 0 : o[k], ctx);
  };
  function compile(tpl) {
    return tpl.replace(/\s+hint-placeholder-(?:val|count)="[^"]*"/g, "");
  }
  function render(tpl, ctx, handlers) {
    let out = "", i = 0;
    const open = /<sc-(if|for)\b([^>]*)>/g;
    while (i < tpl.length) {
      open.lastIndex = i;
      const r = open.exec(tpl);
      if (!r) {
        out += sub(tpl.slice(i), ctx, handlers);
        break;
      }
      out += sub(tpl.slice(i, r.index), ctx, handlers);
      const tag = "sc-" + r[1];
      const re = new RegExp("<" + tag + "\\b[^>]*>|</" + tag + ">", "g");
      re.lastIndex = r.index + r[0].length;
      let depth = 1, m;
      while (depth && (m = re.exec(tpl))) {
        depth += m[0].startsWith("</") ? -1 : 1;
        if (!depth) break;
      }
      const inner = tpl.slice(r.index + r[0].length, m.index);
      i = m.index + m[0].length;
      const am = r[2].match(/(?:value|list)="\{\{([^}]+)\}\}"/);
      const val = am ? get(ctx, am[1]) : void 0;
      if (r[1] === "if") {
        if (val) out += render(inner, ctx, handlers);
      } else {
        const as = (r[2].match(/as="(\w+)"/) || [])[1] || "item";
        (val || []).forEach((it, idx) => {
          out += render(inner, Object.assign(Object.create(ctx), { [as]: it, $index: idx }), handlers);
        });
      }
    }
    return out;
  }
  const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function sub(s, ctx, handlers) {
    s = s.replace(/\son([A-Z][a-zA-Z]*)="\{\{([^}]+)\}\}"/g, (_, ev, path) => {
      const fn = get(ctx, path);
      if (typeof fn !== "function") return "";
      handlers.push(fn);
      return " data-tc-" + ev.toLowerCase() + '="' + (handlers.length - 1) + '"';
    });
    s = s.replace(/\s(disabled|checked|hidden)="\{\{([^}]+)\}\}"/g, (m, attr, path) => get(ctx, path) ? " " + attr : "");
    return s.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const v = get(ctx, path);
      if (v == null || typeof v === "function") return "";
      if (typeof v === "boolean") return v ? "true" : "false";
      return esc(v);
    });
  }
  function morphAttrs(from, to) {
    const cvs = from.nodeName === "CANVAS";
    const ta = to.attributes;
    for (let i = 0; i < ta.length; i++) {
      const a = ta[i];
      if (from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);
    }
    const fa = from.attributes;
    for (let i = fa.length - 1; i >= 0; i--) {
      if (cvs && (fa[i].name === "width" || fa[i].name === "height")) continue;
      if (!to.hasAttribute(fa[i].name)) from.removeAttribute(fa[i].name);
    }
  }
  function morphChildren(from, to) {
    const fk = from.childNodes, tk = Array.from(to.childNodes);
    let i = 0;
    for (; i < tk.length; i++) {
      const t = tk[i], f = fk[i];
      if (!f) {
        from.appendChild(t);
        continue;
      }
      if (f.nodeType !== t.nodeType || f.nodeName !== t.nodeName) {
        from.replaceChild(t, f);
        continue;
      }
      if (f.nodeType === 3 || f.nodeType === 8) {
        if (f.nodeValue !== t.nodeValue) f.nodeValue = t.nodeValue;
        continue;
      }
      morphAttrs(f, t);
      morphChildren(f, t);
    }
    while (fk.length > tk.length) from.removeChild(from.lastChild);
  }
  window.dcMount = function(root, tpl, Component, props, hooks) {
    tpl = compile(tpl);
    const comp = new Component(props || {});
    let handlers = [], queued = false;
    const draw = () => {
      queued = false;
      let vals = comp.renderVals();
      if (hooks && hooks.post) vals = hooks.post(vals, comp) || vals;
      handlers = [];
      const html = render(tpl, vals, handlers);
      const t = document.createElement("template");
      t.innerHTML = html;
      morphChildren(root, t.content);
    };
    comp.__schedule = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(draw);
      }
    };
    const MAP = {
      click: ["click"],
      doubleclick: ["dblclick"],
      pointerdown: ["pointerdown"],
      pointermove: ["pointermove"],
      pointerup: ["pointerup", "pointercancel"],
      pointerleave: ["pointercancel"],
      wheel: ["wheel"],
      change: ["input", "change"],
      input: ["input"]
    };
    const fire = (name, e) => {
      let el = e.target;
      while (el && el !== root.parentNode) {
        const id = el.getAttribute && el.getAttribute("data-tc-" + name);
        if (id != null) {
          const fn = handlers[+id];
          if (fn) {
            const cur = el;
            fn({
              type: e.type,
              target: e.target,
              currentTarget: cur,
              clientX: e.clientX,
              clientY: e.clientY,
              deltaY: e.deltaY,
              pointerId: e.pointerId,
              preventDefault: () => e.preventDefault(),
              stopPropagation: () => e.stopPropagation(),
              nativeEvent: e
            });
          }
          if (name === "click" || name === "doubleclick" || name === "change" || name === "input") return;
        }
        el = el.parentNode;
      }
    };
    Object.keys(MAP).forEach((name) => MAP[name].forEach((dom) => root.addEventListener(dom, (e) => fire(name, e), dom === "wheel" ? { passive: true } : false)));
    draw();
    if (comp.componentDidMount) comp.componentDidMount();
    return comp;
  };
})();
