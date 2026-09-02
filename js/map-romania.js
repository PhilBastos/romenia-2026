/*
 * Mapa estilizado da Romênia em SVG.
 *
 * O contorno do país é decorativo (uma silhueta simplificada, não um mapa
 * cartográfico). As posições das cidades vêm das coordenadas reais do
 * arquivo de dados e são projetadas sobre esse contorno.
 *
 * Os pontos aparecem numerados na ordem da viagem. Os nomes ficam na
 * legenda logo abaixo do mapa (montada pelo app.js) e no painel que
 * aparece ao tocar num ponto. Alguns pontos muito próximos entre si
 * (a região dos Cárpatos) recebem um pequeno deslocamento visual para
 * não se sobreporem — coerente com um mapa estilizado.
 *
 * renderRomania(pontos) devolve uma string SVG. Cada ponto vira um
 * elemento <g data-ponto="i"> que o app.js torna clicável.
 */
window.RomaniaMap = (function () {
  "use strict";

  var VB_W = 900, VB_H = 640, PAD = 54;
  var LNG_MIN = 20.2, LNG_MAX = 29.8, LAT_MIN = 43.6, LAT_MAX = 48.4;

  /* Silhueta simplificada da Romênia — pares [lng, lat], sentido horário. */
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

  /* Deslocamento visual (em unidades do viewBox) para pontos aglomerados. */
  var NUDGE = {
    0: [-4, 12],   // Bucareste (início)
    1: [-8, 8],    // Sinaia · Peleș
    2: [-36, -6],  // Bran
    3: [30, 4],    // Brașov
    6: [-36, 18],  // Sibiu
    7: [-8, 44],   // Transfăgărășan · Bâlea
    8: [20, -18]   // Aeroporto (fim)
  };

  function projX(lng) {
    return PAD + (lng - LNG_MIN) / (LNG_MAX - LNG_MIN) * (VB_W - 2 * PAD);
  }
  function projY(lat) {
    return PAD + (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * (VB_H - 2 * PAD);
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render(pontos) {
    var contorno = CONTORNO.map(function (p, i) {
      return (i ? "L" : "M") + r1(projX(p[0])) + " " + r1(projY(p[1]));
    }).join(" ") + " Z";

    var xy = pontos.map(function (pt, i) {
      var n = NUDGE[i] || [0, 0];
      return { x: projX(pt.coords[1]) + n[0], y: projY(pt.coords[0]) + n[1] };
    });

    var rota = xy.map(function (p, i) {
      return (i ? "L" : "M") + r1(p.x) + " " + r1(p.y);
    }).join(" ");

    var marcadores = pontos.map(function (pt, i) {
      var p = xy[i];
      return (
        '<g class="mapa-ponto" data-ponto="' + i + '" data-dia="' + pt.dia + '" ' +
        'role="button" tabindex="0" aria-label="Parada ' + (i + 1) + ": " +
        esc(pt.nome) + ' — abrir dia ' + pt.dia + '">' +
        '<circle class="mapa-ponto__alvo" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="26"/>' +
        '<circle class="mapa-ponto__dot" cx="' + r1(p.x) + '" cy="' + r1(p.y) + '" r="15"/>' +
        '<text class="mapa-ponto__n" x="' + r1(p.x) + '" y="' + r1(p.y) +
          '" text-anchor="middle" dominant-baseline="central">' + (i + 1) + '</text>' +
        '</g>'
      );
    }).join("");

    return (
      '<svg class="mapa-svg" viewBox="0 0 ' + VB_W + ' ' + VB_H + '" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" ' +
      'aria-label="Mapa estilizado da Romênia com os nove pontos da rota, numerados na ordem da viagem">' +
      '<path class="mapa-pais" d="' + contorno + '"/>' +
      '<path class="mapa-rota" d="' + rota + '"/>' +
      marcadores +
      '</svg>'
    );
  }

  return { render: render };
})();
