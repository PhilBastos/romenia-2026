/*
 * Construção de links para o Google Maps.
 *
 * Regra: o destino é sempre um par de coordenadas precisas (vindo do
 * arquivo de dados). A origem é omitida de propósito — assim o Google Maps
 * usa a posição atual do aparelho como ponto de partida, que é o que os
 * viajantes querem ("estou aqui, me leve até lá").
 */
window.Maps = (function () {
  "use strict";

  function temCoords(coords) {
    return Array.isArray(coords) && coords.length === 2 &&
      typeof coords[0] === "number" && typeof coords[1] === "number";
  }

  /* Rota (navegação turn-by-turn) a partir da posição atual. */
  function rota(coords, modo) {
    if (!temCoords(coords)) return null;
    var travelmode = modo === "walking" ? "walking" : "driving";
    return "https://www.google.com/maps/dir/?api=1" +
      "&destination=" + coords[0] + "," + coords[1] +
      "&travelmode=" + travelmode;
  }

  /* Apenas mostrar o ponto no mapa (sem traçar rota). */
  function ponto(coords, rotulo) {
    if (!temCoords(coords)) return null;
    var q = coords[0] + "," + coords[1];
    if (rotulo) q = encodeURIComponent(rotulo) + "@" + q;
    return "https://www.google.com/maps/search/?api=1&query=" +
      coords[0] + "," + coords[1];
  }

  return { rota: rota, ponto: ponto, temCoords: temCoords };
})();
