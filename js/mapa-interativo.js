/*
 * Zoom e navegação dentro do quadro do mapa.
 *
 * Estado normal: mapa parado, foto de fundo visível, a página rola
 * normalmente ao arrastar sobre o mapa.
 * Com zoom (botão +): o fundo fica chapado e é possível arrastar para
 * navegar — sempre contido dentro do quadro. O botão de recolher volta
 * ao estado normal.
 *
 * MapaInterativo(quadroEl) liga os controles de um .mapa-quadro.
 */
window.MapaInterativo = function (quadro) {
  "use strict";
  var pan = quadro.querySelector(".mapa-pan");
  var vp = quadro.querySelector(".mapa-viewport");
  if (!pan || !vp) return;

  var MIN = 1, MAX = 4.5;
  var k = 1, tx = 0, ty = 0;

  function aplicar() {
    pan.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + k.toFixed(3) + ")";
    var zoom = k > 1.02;
    quadro.classList.toggle("mapa-quadro--zoom", zoom);
  }
  function conter() {
    var w = vp.clientWidth, h = vp.clientHeight;
    tx = Math.min(0, Math.max(w - w * k, tx));
    ty = Math.min(0, Math.max(h - h * k, ty));
  }
  function zoomPara(nk, cx, cy) {
    nk = Math.min(MAX, Math.max(MIN, nk));
    if (nk === k) return;
    var r = nk / k;
    tx = cx - (cx - tx) * r;
    ty = cy - (cy - ty) * r;
    k = nk;
    conter();
    aplicar();
  }
  function centro() { return [vp.clientWidth / 2, vp.clientHeight / 2]; }
  function resetar() { k = 1; tx = 0; ty = 0; aplicar(); }

  quadro.querySelectorAll("[data-zoom]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-zoom"), c = centro();
      if (a === "in") zoomPara(k * 1.7, c[0], c[1]);
      else if (a === "out") zoomPara(k / 1.7, c[0], c[1]);
      else resetar();
    });
  });

  /* arraste + pinça (só quando com zoom) */
  var ativos = new Map(), arraste = null, pinca = null;

  vp.addEventListener("pointerdown", function (e) {
    if (k <= 1.02) return;
    ativos.set(e.pointerId, e);
    try { vp.setPointerCapture(e.pointerId); } catch (x) {}
    if (ativos.size === 1) arraste = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
    else { arraste = null; pinca = null; }
  });

  vp.addEventListener("pointermove", function (e) {
    if (!ativos.has(e.pointerId)) return;
    ativos.set(e.pointerId, e);
    var lista = Array.prototype.slice.call(ativos.values());
    if (lista.length >= 2) {
      var d = Math.hypot(lista[0].clientX - lista[1].clientX, lista[0].clientY - lista[1].clientY);
      var rc = vp.getBoundingClientRect();
      var mx = (lista[0].clientX + lista[1].clientX) / 2 - rc.left;
      var my = (lista[0].clientY + lista[1].clientY) / 2 - rc.top;
      if (pinca) zoomPara(k * (d / pinca), mx, my);
      pinca = d;
    } else if (arraste) {
      tx = arraste.tx + (e.clientX - arraste.x);
      ty = arraste.ty + (e.clientY - arraste.y);
      conter();
      aplicar();
    }
  });

  function soltar(e) {
    ativos.delete(e.pointerId);
    if (ativos.size < 2) pinca = null;
    if (ativos.size === 0) arraste = null;
  }
  vp.addEventListener("pointerup", soltar);
  vp.addEventListener("pointercancel", soltar);

  vp.addEventListener("wheel", function (e) {
    e.preventDefault();
    var rc = vp.getBoundingClientRect();
    zoomPara(k * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX - rc.left, e.clientY - rc.top);
  }, { passive: false });

  window.addEventListener("resize", function () { conter(); aplicar(); });
  aplicar();
};
