/*
 * Zoom e navegação dentro do quadro do mapa.
 *
 * Segundo os princípios de interface fluida da Apple (WWDC "Designing
 * Fluid Interfaces"):
 *  - resposta imediata: o mapa segue o dedo 1:1;
 *  - interrompível: tocar durante um movimento o captura na hora;
 *  - momento: ao soltar um arrasto rápido, o mapa desliza e desacelera;
 *  - bordas elásticas: resiste em vez de travar;
 *  - molas (não durações fixas) para o zoom e para o retorno das bordas;
 *  - respeita prefers-reduced-motion (sem inércia nem oscilação).
 *
 * MapaInterativo(quadroEl) liga os controles de um .mapa-quadro.
 */
window.MapaInterativo = function (quadro) {
  "use strict";
  var pan = quadro.querySelector(".mapa-pan");
  var vp = quadro.querySelector(".mapa-viewport");
  if (!pan || !vp) return;

  var REDUZ = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MIN = 1, MAX = 4.5;

  /* estado apresentado (tela) + alvo da mola + velocidade */
  var x = 0, y = 0, k = 1;
  var xt = 0, yt = 0, kt = 1;
  var vx = 0, vy = 0, vk = 0;
  var raf = 0, arrastando = false;

  /* mola crítica: resposta ~0.42 s, sem oscilação */
  var w0 = 2 * Math.PI / 0.42;
  var RIG = w0 * w0, AMO = 2 * w0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function limites() {
    var w = vp.clientWidth || 1, h = vp.clientHeight || 1;
    return { minx: w - w * k, miny: h - h * k, w: w, h: h };
  }
  function elastico(raw, borda, dim) {
    var over = raw - borda, c = 0.55;
    return borda + (over * dim * c) / (dim + c * Math.abs(over));
  }
  function aplicar() {
    pan.style.transform =
      "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px) scale(" + k.toFixed(4) + ")";
    quadro.classList.toggle("mapa-quadro--zoom", k > 1.015);
  }
  function acomodarAlvo() {
    kt = clamp(kt, MIN, MAX);
    var w = vp.clientWidth, h = vp.clientHeight;
    xt = clamp(xt, w - w * kt, 0);
    yt = clamp(yt, h - h * kt, 0);
  }

  var tPrev = 0;
  function passo(t) {
    var dt = tPrev ? Math.min(0.032, (t - tPrev) / 1000) : 0.016;
    tPrev = t;
    var vivo = false;

    var ax = RIG * (xt - x) - AMO * vx; vx += ax * dt; x += vx * dt;
    var ay = RIG * (yt - y) - AMO * vy; vy += ay * dt; y += vy * dt;
    var ak = RIG * (kt - k) - AMO * vk; vk += ak * dt; k += vk * dt;

    if (Math.abs(xt - x) < 0.05 && Math.abs(vx) < 0.05) { x = xt; vx = 0; } else vivo = true;
    if (Math.abs(yt - y) < 0.05 && Math.abs(vy) < 0.05) { y = yt; vy = 0; } else vivo = true;
    if (Math.abs(kt - k) < 0.0004 && Math.abs(vk) < 0.0004) { k = kt; vk = 0; } else vivo = true;

    aplicar();
    if (vivo) raf = requestAnimationFrame(passo);
    else { raf = 0; tPrev = 0; }
  }
  function molaOn() {
    if (REDUZ) { x = xt; y = yt; k = kt; vx = vy = vk = 0; aplicar(); return; }
    if (!raf) { tPrev = 0; raf = requestAnimationFrame(passo); }
  }
  function molaOff() { if (raf) cancelAnimationFrame(raf); raf = 0; tPrev = 0; }

  /* momento: projeção exponencial de repouso (WWDC) */
  function projetar(v) { return (v / 1000) * 0.997 / (1 - 0.997); }

  function zoomPara(nk, cx, cy) {
    nk = clamp(nk, MIN, MAX);
    var kb = raf ? kt : k, xb = raf ? xt : x, yb = raf ? yt : y;
    var r = nk / kb;
    xt = cx - (cx - xb) * r;
    yt = cy - (cy - yb) * r;
    kt = nk;
    acomodarAlvo();
    molaOn();
  }
  function centro() { return [vp.clientWidth / 2, vp.clientHeight / 2]; }

  quadro.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-zoom"), c = centro(), kb = raf ? kt : k;
      if (a === "in") zoomPara(kb * 1.8, c[0], c[1]);
      else if (a === "out") zoomPara(kb / 1.8, c[0], c[1]);
      else { xt = 0; yt = 0; kt = 1; molaOn(); }
    });
  });

  /* ---- ponteiros ---- */
  var ativos = new Map(), hist = [], grab = null, pinca = 0;

  vp.addEventListener("pointerdown", function (e) {
    if (k <= 1.015 && ativos.size === 0) return;   // sem zoom: página rola normalmente
    ativos.set(e.pointerId, e);
    try { vp.setPointerCapture(e.pointerId); } catch (err) {}
    molaOff();                                     // interrompe: congela no valor atual
    xt = x; yt = y; kt = k; vx = vy = vk = 0;
    if (ativos.size === 1) {
      arrastando = true;
      grab = { px: e.clientX, py: e.clientY, x: x, y: y };
      hist = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    } else { arrastando = false; grab = null; pinca = 0; }
  });

  vp.addEventListener("pointermove", function (e) {
    if (!ativos.has(e.pointerId)) return;
    ativos.set(e.pointerId, e);
    var L = Array.prototype.slice.call(ativos.values());

    if (L.length >= 2) {
      var d = Math.hypot(L[0].clientX - L[1].clientX, L[0].clientY - L[1].clientY);
      var rc = vp.getBoundingClientRect();
      var mx = (L[0].clientX + L[1].clientX) / 2 - rc.left;
      var my = (L[0].clientY + L[1].clientY) / 2 - rc.top;
      if (pinca) {
        var nk = clamp(k * (d / pinca), MIN * 0.9, MAX * 1.08);
        var r = nk / k;
        x = mx - (mx - x) * r; y = my - (my - y) * r; k = nk;
        xt = x; yt = y; kt = k; aplicar();
      }
      pinca = d;
      return;
    }

    if (!arrastando || !grab) return;
    var b = limites();
    var rx = grab.x + (e.clientX - grab.px);
    var ry = grab.y + (e.clientY - grab.py);
    x = rx > 0 ? elastico(rx, 0, b.w) : rx < b.minx ? elastico(rx, b.minx, b.w) : rx;
    y = ry > 0 ? elastico(ry, 0, b.h) : ry < b.miny ? elastico(ry, b.miny, b.h) : ry;
    xt = x; yt = y; kt = k; aplicar();
    hist.push({ t: performance.now(), x: e.clientX, y: e.clientY });
    if (hist.length > 6) hist.shift();
  });

  function soltar(e) {
    if (!ativos.has(e.pointerId)) return;
    ativos.delete(e.pointerId);
    if (ativos.size >= 1) { pinca = 0; grab = null; arrastando = false; return; }

    var b = limites();
    if (arrastando && hist.length >= 2) {
      var a0 = hist[0], a1 = hist[hist.length - 1];
      var dtv = Math.max(1, a1.t - a0.t);
      vx = (a1.x - a0.x) / dtv * 1000;
      vy = (a1.y - a0.y) / dtv * 1000;
      xt = clamp(x + projetar(vx) * 0.82, b.minx, 0);
      yt = clamp(y + projetar(vy) * 0.82, b.miny, 0);
    } else {
      vx = vy = 0;
      xt = clamp(x, b.minx, 0);
      yt = clamp(y, b.miny, 0);
    }
    kt = clamp(k, MIN, MAX); vk = 0;
    arrastando = false; grab = null; pinca = 0;
    molaOn();
  }
  vp.addEventListener("pointerup", soltar);
  vp.addEventListener("pointercancel", soltar);

  vp.addEventListener("wheel", function (e) {
    e.preventDefault();
    var rc = vp.getBoundingClientRect();
    zoomPara((raf ? kt : k) * (e.deltaY < 0 ? 1.22 : 1 / 1.22), e.clientX - rc.left, e.clientY - rc.top);
  }, { passive: false });

  window.addEventListener("resize", function () {
    acomodarAlvo();
    molaOn();
  });

  aplicar();
};
