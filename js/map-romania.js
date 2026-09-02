/*
 * Mapa atmosférico da road trip em SVG.
 *
 * O enquadramento acompanha a ROTA (não o país inteiro): a projeção vem
 * das coordenadas reais das paradas, com margem, para o trajeto ocupar
 * bem o quadro. A silhueta da Romênia entra como pano de fundo discreto.
 *
 * Nem toda parada recebe rótulo: duas ficam sem nome (Sinaia, junto de
 * Bran; e o Aeroporto, junto de Bucareste) para os textos não se
 * amontoarem. Todas continuam clicáveis. O nó dos Cárpatos é "aberto"
 * com pequenos deslocamentos visuais — coerente com um mapa estilizado.
 *
 * RomaniaMap.render(pontos, opts) → string SVG. Cada ponto é um
 * <g class="mapa-ponto" data-ponto data-dia> que o app.js torna clicável.
 * opts.slice = true recorta para molduras altas (tela do Mapa).
 */
window.RomaniaMap = (function () {
  "use strict";

  var VB_W = 820, VB_H = 780, PAD = 104;

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

  /* Deslocamento visual (unidades do viewBox) para "abrir" o nó dos Cárpatos. */
  var NUDGE = {
    0: [10, 14],    // Bucareste
    1: [4, 26],     // Sinaia · Peleș (sem rótulo)
    2: [-54, 0],    // Bran
    3: [56, 12],    // Brașov
    5: [0, -10],    // Turda
    6: [-52, 6],    // Sibiu
    7: [-2, 58],    // Transfăgărășan
    8: [34, -16]    // Aeroporto (sem rótulo)
  };

  /* Rótulo por ponto: [ancoragem, dx, dy] ou null (sem rótulo). */
  var LABEL = [
    ["middle", 0, 34],   // 0 Bucareste
    null,                // 1 Sinaia · Peleș
    ["end", -18, 3],     // 2 Bran
    ["start", 18, 8],    // 3 Brașov
    ["start", 18, 2],    // 4 Sighișoara
    ["middle", 0, -22],  // 5 Turda
    ["end", -18, 3],     // 6 Sibiu
    ["middle", 0, 32],   // 7 Transfăgărășan
    null                 // 8 Aeroporto
  ];

  function r1(n) { return Math.round(n * 10) / 10; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function suave(pts) {
    var d = "M" + r1(pts[0].x) + " " + r1(pts[0].y);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i];
      var p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += " C" +
        r1(p1.x + (p2.x - p0.x) / 6) + " " + r1(p1.y + (p2.y - p0.y) / 6) + " " +
        r1(p2.x - (p3.x - p1.x) / 6) + " " + r1(p2.y - (p3.y - p1.y) / 6) + " " +
        r1(p2.x) + " " + r1(p2.y);
    }
    return d;
  }

  function render(pontos, opts) {
    opts = opts || {};
    var par = opts.slice ? "xMidYMid slice" : "xMidYMid meet";

    var lat = pontos.map(function (p) { return p.coords[0]; });
    var lng = pontos.map(function (p) { return p.coords[1]; });
    var laMin = Math.min.apply(null, lat), laMax = Math.max.apply(null, lat);
    var loMin = Math.min.apply(null, lng), loMax = Math.max.apply(null, lng);
    laMin -= (laMax - laMin) * 0.34 + 0.15; laMax += (laMax - laMin) * 0.12 + 0.15;
    loMin -= (loMax - loMin) * 0.30 + 0.15; loMax += (loMax - loMin) * 0.30 + 0.15;

    var cx = Math.cos((laMin + laMax) / 2 * Math.PI / 180);
    var geoW = (loMax - loMin) * cx, geoH = (laMax - laMin);
    var s = Math.min((VB_W - 2 * PAD) / geoW, (VB_H - 2 * PAD) / geoH);
    var offX = (VB_W - geoW * s) / 2, offY = (VB_H - geoH * s) / 2;
    function projX(lo) { return offX + (lo - loMin) * cx * s; }
    function projY(la) { return offY + (laMax - la) * s; }

    var contorno = CONTORNO.map(function (p, i) {
      return (i ? "L" : "M") + r1(projX(p[0])) + " " + r1(projY(p[1]));
    }).join(" ") + " Z";

    var xy = pontos.map(function (pt, i) {
      var n = NUDGE[i] || [0, 0];
      return { x: projX(pt.coords[1]) + n[0], y: projY(pt.coords[0]) + n[1] };
    });

    var rota = suave(xy);

    var marcadores = pontos.map(function (pt, i) {
      var p = xy[i], cfg = LABEL[i];
      var extremo = i === 0 || !!pt.fim;
      return (
        '<g class="mapa-ponto" data-ponto="' + i + '" data-dia="' + pt.dia + '" ' +
        'role="button" tabindex="0" aria-label="Parada ' + (i + 1) + ": " +
        esc(pt.nome) + ' — abrir o dia ' + pt.dia + '">' +
        '<circle class="mapa-ponto__alvo" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="32"/>' +
        '<circle class="mapa-ponto__halo" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="12"/>' +
        '<circle class="mapa-ponto__dot" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="6"/>' +
        (extremo ? '<circle class="mapa-ponto__anel" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="10.5"/>' : "") +
        (cfg
          ? '<text class="mapa-ponto__label" x="' + r1(p.x + cfg[1]) + '" y="' + r1(p.y + cfg[2]) +
            '" text-anchor="' + cfg[0] + '">' + esc(pt.nome) + "</text>"
          : "") +
        "</g>"
      );
    }).join("");

    return (
      '<svg class="mapa-svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" ' +
      'xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="' + par + '" ' +
      'role="img" aria-label="Mapa da road trip pela Romênia, nove paradas na ordem da viagem">' +
      '<defs><linearGradient id="mapaCeu" x1="0" y1="0" x2="0.35" y2="1">' +
      '<stop offset="0" stop-color="#31434a"/>' +
      '<stop offset="0.6" stop-color="#3d4d58"/>' +
      '<stop offset="1" stop-color="#46545c"/>' +
      "</linearGradient></defs>" +
      '<rect x="0" y="0" width="' + VB_W + '" height="' + VB_H + '" fill="url(#mapaCeu)"/>' +
      '<path class="mapa-pais" d="' + contorno + '"/>' +
      '<path class="mapa-rota-brilho" d="' + rota + '"/>' +
      '<path class="mapa-rota" d="' + rota + '"/>' +
      marcadores +
      "</svg>"
    );
  }

  return { render: render };
})();
