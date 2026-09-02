/*
 * Mapa da road trip em SVG.
 *
 * A linha segue o traçado real das rodovias (data/routes.js, gerado a
 * partir do OpenStreetMap). O enquadramento acompanha a rota. Os nomes
 * das cidades são discretos. As formas ficam finas e delicadas; os
 * traços usam vector-effect="non-scaling-stroke" para não engrossarem
 * quando o mapa é ampliado (o zoom é aplicado por CSS no elemento pai).
 *
 * RomaniaMap.render(pontos) → string <svg>.
 * Cada ponto é um <g class="mapa-ponto" data-ponto data-dia> clicável.
 */
window.RomaniaMap = (function () {
  "use strict";

  var VB_W = 1000, VB_H = 1180, PAD = 132;

  var CONTORNO = [
    [22.90, 47.95], [23.90, 48.05], [24.90, 47.98], [25.60, 47.97],
    [26.25, 48.28], [26.65, 48.28], [27.25, 47.90], [28.05, 47.10],
    [28.22, 46.50], [28.10, 45.90], [28.55, 45.55], [28.20, 45.42],
    [29.72, 45.20], [29.05, 44.72], [28.68, 44.05], [28.60, 43.72],
    [27.90, 43.72], [26.60, 44.05], [25.45, 43.65], [24.30, 43.78],
    [22.95, 43.82], [22.55, 44.22], [22.30, 44.62], [21.55, 44.92],
    [20.80, 45.52], [20.25, 45.78], [20.75, 46.18], [21.30, 46.62],
    [22.00, 47.18], [22.62, 47.62]
  ];

  var NUDGE = {
    0: [8, 12], 1: [4, 24], 2: [-46, 0], 3: [48, 10],
    5: [0, -8], 6: [-46, 4], 7: [-4, 50], 8: [30, -14]
  };
  var LABEL = [
    ["middle", 0, 30], null, ["end", -14, 3], ["start", 14, 6],
    ["start", 14, 2], ["middle", 0, -20], ["end", -14, 3],
    ["middle", 0, 28], null
  ];

  function r1(n) { return Math.round(n * 10) / 10; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render(pontos) {
    var R = window.ROUTES || {};

    /* todos os pontos que definem o enquadramento: paradas + traçado */
    var all = pontos.map(function (p) { return [p.coords[1], p.coords[0]]; });
    Object.keys(R).forEach(function (k) {
      R[k].pts.forEach(function (c) { all.push(c); });
    });
    var lo = all.map(function (c) { return c[0]; });
    var la = all.map(function (c) { return c[1]; });
    var loMin = Math.min.apply(null, lo), loMax = Math.max.apply(null, lo);
    var laMin = Math.min.apply(null, la), laMax = Math.max.apply(null, la);
    var mLo = (loMax - loMin) * 0.06 + 0.05;
    var mLa = (laMax - laMin) * 0.06 + 0.05;
    loMin -= mLo; loMax += mLo; laMin -= mLa; laMax += mLa;

    var cx = Math.cos((laMin + laMax) / 2 * Math.PI / 180);
    var geoW = (loMax - loMin) * cx, geoH = (laMax - laMin);
    var s = Math.min((VB_W - 2 * PAD) / geoW, (VB_H - 2 * PAD) / geoH);
    var offX = (VB_W - geoW * s) / 2, offY = (VB_H - geoH * s) / 2;
    function X(lo) { return offX + (lo - loMin) * cx * s; }
    function Y(la) { return offY + (laMax - la) * s; }

    var contorno = CONTORNO.map(function (p, i) {
      return (i ? "L" : "M") + r1(X(p[0])) + " " + r1(Y(p[1]));
    }).join(" ") + " Z";

    /* rota: um único path com o traçado real de todos os trechos */
    var rota = "";
    Object.keys(R).sort().forEach(function (k) {
      var pts = R[k].pts;
      rota += pts.map(function (c, i) {
        return (i ? "L" : "M") + r1(X(c[0])) + " " + r1(Y(c[1]));
      }).join(" ") + " ";
    });
    if (!rota) {
      rota = pontos.map(function (p, i) {
        return (i ? "L" : "M") + r1(X(p.coords[1])) + " " + r1(Y(p.coords[0]));
      }).join(" ");
    }

    var xy = pontos.map(function (pt, i) {
      var n = NUDGE[i] || [0, 0];
      return { x: X(pt.coords[1]) + n[0], y: Y(pt.coords[0]) + n[1] };
    });

    var marcadores = pontos.map(function (pt, i) {
      var p = xy[i], cfg = LABEL[i];
      var extremo = i === 0 || !!pt.fim;
      var rotulo = "";
      if (cfg) {
        var fs = 17, lx = p.x + cfg[1], ly = p.y + cfg[2];
        var w = pt.nome.length * fs * 0.56 + 16, h = 25;
        var rx = cfg[0] === "end" ? lx - w : cfg[0] === "middle" ? lx - w / 2 : lx;
        rotulo =
          '<rect class="mapa-ponto__chip" x="' + r1(rx) + '" y="' + r1(ly - h / 2) +
          '" width="' + r1(w) + '" height="' + h + '" rx="8"/>' +
          '<text class="mapa-ponto__label" x="' + r1(lx) + '" y="' + r1(ly) +
          '" text-anchor="' + cfg[0] + '">' + esc(pt.nome) + "</text>";
      }
      return (
        '<g class="mapa-ponto" data-ponto="' + i + '" data-dia="' + pt.dia + '" ' +
        'role="button" tabindex="0" aria-label="Parada ' + (i + 1) + ": " +
        esc(pt.nome) + ' — abrir o dia ' + pt.dia + '">' +
        '<circle class="mapa-ponto__alvo" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="34"/>' +
        '<circle class="mapa-ponto__dot" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="' +
        (extremo ? 5 : 3.6) + '"/>' +
        (extremo ? '<circle class="mapa-ponto__anel" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="8.5"/>' : "") +
        rotulo +
        "</g>"
      );
    }).join("");

    return (
      '<svg class="mapa-svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" ' +
      'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" ' +
      'role="img" aria-label="Mapa da road trip pela Romênia, nove paradas na ordem da viagem">' +
      '<path class="mapa-pais" d="' + contorno + '" vector-effect="non-scaling-stroke"/>' +
      '<path class="mapa-rota-brilho" d="' + rota + '" vector-effect="non-scaling-stroke"/>' +
      '<path class="mapa-rota" d="' + rota + '" vector-effect="non-scaling-stroke"/>' +
      marcadores +
      "</svg>"
    );
  }

  return { render: render };
})();
