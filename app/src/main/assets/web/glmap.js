/* Tom's Car 0.9.13 (#126) — vector map (MapLibre GL) behind the small part of the Leaflet API that nav.js uses,
   so the navigation code stays the same and the old map stays available as "Bản đồ kiểu cũ".
   Points are [lat, lon] like Leaflet; MapLibre wants [lon, lat]. */
(() => {
  'use strict';
  const ml = window.maplibregl;
  const glOk = (() => { try { const c = document.createElement('canvas'); return !!(ml && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } })();
  const LL = (p) => Array.isArray(p) ? [p[1], p[0]] : [p.lng != null ? p.lng : p.lon, p.lat];
  const toLatLng = (a) => ({ lat: a[1], lng: a[0] });

  // bounds in [lat, lon], with Leaflet's extend / isValid
  class Bounds {
    constructor(a, b) { this.s = 90; this.w = 180; this.n = -90; this.e = -180; if (a) this.extend(a); if (b) this.extend(b); }
    extend(x) {
      if (!x) return this;
      if (x instanceof Bounds) { if (x.isValid()) { this.extend([x.s, x.w]); this.extend([x.n, x.e]); } return this; }
      const lat = Array.isArray(x) ? x[0] : x.lat, lon = Array.isArray(x) ? x[1] : (x.lng != null ? x.lng : x.lon);
      if (lat == null || lon == null) return this;
      this.s = Math.min(this.s, lat); this.n = Math.max(this.n, lat); this.w = Math.min(this.w, lon); this.e = Math.max(this.e, lon); return this;
    }
    isValid() { return this.n >= this.s && this.e >= this.w; }
  }

  let uid = 0;
  class Line {
    constructor(pts, o) { this.pts = pts; this.o = o || {}; this.id = 'tcl' + (++uid); this.map = null; this.clicks = []; }
    addTo(m) { this.map = m; m._lines.push(this); m._addLine(this); return this; }
    setLatLngs(pts) { this.pts = pts; const s = this.map && this.map.gl.getSource(this.id); if (s) s.setData(this.geo()); return this; }
    geo() { return { type: 'Feature', geometry: { type: 'LineString', coordinates: (this.pts || []).map(LL) } }; }
    getBounds() { const b = new Bounds(); (this.pts || []).forEach((p) => b.extend(p)); return b; }
    on(ev, fn) { if (ev === 'click') this.clicks.push(fn); return this; }
    bringToBack() { if (this.map) this.map._toBack(this); return this; }
  }

  class Pin {
    constructor(ll, o) {
      this.ll = ll; this.o = o || {};
      this.el = document.createElement('div'); this.el.style.cssText = 'width:0;height:0;overflow:visible';
      if (this.o.zIndexOffset) this.el.style.zIndex = String(1000 + this.o.zIndexOffset);
      this.setIcon(this.o.icon); this.mk = null; this.map = null;
    }
    addTo(m) { this.map = m; this.mk = new ml.Marker({ element: this.el, anchor: 'top-left', rotationAlignment: this.o.flat ? 'map' : 'viewport', pitchAlignment: this.o.flat ? 'map' : 'viewport' }).setLngLat(LL(this.ll)).addTo(m.gl); m._pins.push(this); return this; }
    setLatLng(ll) { this.ll = ll; if (this.mk) this.mk.setLngLat(LL(ll)); return this; }
    getLatLng() { return { lat: this.ll[0], lng: this.ll[1] }; }
    setIcon(ic) { this.el.innerHTML = ic && ic.html ? ic.html : ''; return this; }
    setRotation(d) { if (this.mk) this.mk.setRotation(d); return this; }
    on(ev, fn) { if (ev === 'click') this.el.addEventListener('click', (e) => { e.stopPropagation(); fn(e); }); return this; }
    off() { return this; }
    remove() { if (this.mk) this.mk.remove(); if (this.map) this.map._pins = this.map._pins.filter((p) => p !== this); this.mk = null; }
  }

  class GMap {
    constructor(el, o) {
      this._lines = []; this._pins = []; this._ev = {}; this._style = null; this.styleKey = '';
      this.gl = new ml.Map({ container: el, style: o.style, center: LL(o.center || [-37.75, 144.73]), zoom: o.zoom || 13, attributionControl: { compact: true }, pixelRatio: Math.min(4, (window.devicePixelRatio || 1) * (window.__stageScale || 1)),
        maxPitch: 60, dragRotate: true, touchPitch: false, pitchWithRotate: false, fadeDuration: 150, refreshExpiredTiles: false, maxTileCacheSize: 120 });
      this.gl.touchZoomRotate.enableRotation();
      this.gl.on('style.load', () => { this._lines.forEach((l) => this._addLine(l)); });
      this.gl.on('click', (e) => {
        const f = this.gl.queryRenderedFeatures(e.point, { layers: this._lines.filter((l) => l.clicks.length && this.gl.getLayer(l.id)).map((l) => l.id) });
        if (f && f.length) { const l = this._lines.find((x) => x.id === f[0].layer.id); if (l) { l.clicks.forEach((fn) => fn(e)); return; } }
        (this._ev.click || []).forEach((fn) => fn({ latlng: toLatLng(e.lngLat.toArray()) }));
      });
      // only the person's own drag / pinch / twist stops "follow the car" — not the camera moves the app makes
      ['dragstart', 'rotatestart', 'pitchstart'].forEach((n) => this.gl.on(n, (e) => { if (e.originalEvent) (this._ev.dragstart || []).forEach((fn) => fn(e)); }));
      this.gl.on('zoomstart', (e) => { if (e.originalEvent) (this._ev.dragstart || []).forEach((fn) => fn(e)); });
      this.gl.on('zoomend', () => (this._ev.zoomend || []).forEach((fn) => fn()));
      this.attributionControl = { setPrefix() {} };
      this.dragging = this.touchZoom = this.doubleClickZoom = { enable() {}, disable() {} };
    }
    on(n, fn) { (this._ev[n] = this._ev[n] || []).push(fn); return this; }
    setStyle(key, style) { if (this.styleKey === key) return; this.styleKey = key; this.gl.setStyle(style, { diff: false }); }
    _firstSymbol() { const L = (this.gl.getStyle() || {}).layers || []; const s = L.find((l) => l.type === 'symbol'); return s ? s.id : undefined; }
    _addLine(l) {
      const g = this.gl; if (!g.isStyleLoaded() && !g.getStyle()) return;
      try {
        if (g.getLayer(l.id)) g.removeLayer(l.id); if (g.getSource(l.id)) g.removeSource(l.id);
        g.addSource(l.id, { type: 'geojson', data: l.geo() });
        g.addLayer({ id: l.id, type: 'line', source: l.id, layout: { 'line-cap': l.o.lineCap === 'round' || !l.o.lineCap ? 'round' : l.o.lineCap, 'line-join': 'round' },
          paint: { 'line-color': l.o.color || '#2fd0f5', 'line-width': l.o.weight || 6, 'line-opacity': l.o.opacity == null ? 1 : l.o.opacity } }, this._firstSymbol());
      } catch (e) { /* style still loading — style.load adds it */ }
    }
    _toBack(l) { const g = this.gl; const ours = this._lines.filter((x) => x !== l && g.getLayer(x.id)); if (ours.length && g.getLayer(l.id)) { try { g.moveLayer(l.id, ours[0].id); } catch (e) {} } }
    removeLayer(x) {
      if (!x) return this;
      if (x instanceof Pin) { x.remove(); return this; }
      if (x instanceof Line) { const g = this.gl; try { if (g.getLayer(x.id)) g.removeLayer(x.id); if (g.getSource(x.id)) g.removeSource(x.id); } catch (e) {} this._lines = this._lines.filter((l) => l !== x); x.map = null; }
      return this;
    }
    getZoom() { return this.gl.getZoom(); }
    setZoom(z) { this.gl.setZoom(z); return this; }
    zoomIn(n) { this.gl.zoomIn({ duration: 250 }); return this; }
    zoomOut(n) { this.gl.zoomOut({ duration: 250 }); return this; }
    getCenter() { const c = this.gl.getCenter(); return { lat: c.lat, lng: c.lng }; }
    setView(ll, z, o) { const opt = { center: LL(ll), zoom: z == null ? this.gl.getZoom() : z }; if (o && o.animate) this.gl.easeTo(Object.assign(opt, { duration: 600 })); else this.gl.jumpTo(opt); return this; }
    panBy(d) { this.gl.panBy(d, { duration: 0 }); return this; }
    fitBounds(b, o) {
      if (!b || !b.isValid()) return this; o = o || {};
      const tl = o.paddingTopLeft || [40, 40], br = o.paddingBottomRight || [40, 40];
      const W = this.gl.getContainer().clientWidth, H = this.gl.getContainer().clientHeight;
      const pad = { left: Math.min(tl[0], W * 0.6), top: Math.min(tl[1], H * 0.45), right: Math.min(br[0], W * 0.3), bottom: Math.min(br[1], H * 0.4) };
      try { this.gl.fitBounds([[b.w, b.s], [b.e, b.n]], { padding: pad, maxZoom: o.maxZoom || 16, bearing: 0, pitch: 0, duration: 700 }); } catch (e) {}
      return this;
    }
    invalidateSize() { try { const pr = Math.min(4, (window.devicePixelRatio || 1) * (window.__stageScale || 1)); if (Math.abs(pr - this.gl.getPixelRatio()) > 0.05) this.gl.setPixelRatio(pr); } catch (e) {} this.gl.resize(); return this; }
  }

  window.GLL = glOk ? {
    ok: true,
    map: (el, o) => new GMap(el, o || {}),
    polyline: (pts, o) => new Line(pts, o),
    marker: (ll, o) => new Pin(ll, o),
    divIcon: (o) => ({ html: o.html }),
    latLngBounds: (a, b) => new Bounds(a, b),
    Bounds
  } : { ok: false };
})();
