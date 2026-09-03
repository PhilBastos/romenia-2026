/*
 * ROMÊNIA 2026 — aplicação
 *
 * Guia pessoal de viagem. Lê todo o conteúdo de data/itinerary.js e monta
 * as telas: Hoje, Roteiro, Dia, Parada, Mapa e Viagem.
 *
 * Não há build. Roteamento por hash (#/...), compatível com GitHub Pages.
 */
(function () {
  "use strict";

  var DATA = window.ITINERARY;
  var main = document.getElementById("app");
  var vivo = document.getElementById("anuncio");

  /* ============================================================= util */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }
  function isPendente(v) {
    return !v || (typeof v === "string" && /_A_DEFINIR\b/.test(v));
  }
  function soDigitos(t) { return String(t).replace(/[^\d+]/g, ""); }

  /* ------------------------------------------------------------- datas */

  function hojeISO() {
    var m = location.search.match(/[?&]hoje=(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  function dataObj(iso) { return new Date(iso + "T12:00:00"); }
  function fmtDataLonga(iso) {
    try {
      return dataObj(iso).toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long"
      });
    } catch (e) { return iso; }
  }
  function fmtDiaSemana(iso) {
    try {
      return dataObj(iso).toLocaleDateString("pt-BR", { weekday: "long" });
    } catch (e) { return ""; }
  }
  function diasEntre(aISO, bISO) {
    return Math.round((dataObj(bISO) - dataObj(aISO)) / 86400000);
  }
  function fase() {
    var h = hojeISO();
    if (h < DATA.meta.dataInicio) return "antes";
    if (h > DATA.meta.dataFim) return "depois";
    return "durante";
  }
  function indiceDiaAtual() {
    var h = hojeISO();
    var exato = DATA.dias.findIndex(function (d) { return d.data === h; });
    if (exato !== -1) return exato;
    var i, ultimo = -1;
    for (i = 0; i < DATA.dias.length; i++) {
      if (DATA.dias[i].data <= h) ultimo = i;
    }
    return ultimo;
  }
  function saudacao() {
    var hr = new Date().getHours();
    if (hr < 12) return "Bom dia";
    if (hr < 18) return "Boa tarde";
    return "Boa noite";
  }
  function fmtMin(min) {
    if (min == null) return "";
    if (min < 60) return min + " min";
    var h = Math.floor(min / 60), m = min % 60;
    return m ? h + " h " + m + " min" : h + " h";
  }
  function fmtTrecho(leg) {
    if (!leg) return "";
    var p = [];
    if (leg.km != null && leg.km >= 1) p.push("aprox. " + leg.km + " km");
    if (leg.min != null) p.push(fmtMin(leg.min));
    if (leg.nota) p.push(leg.nota);
    return p.join(" · ");
  }

  function chegadaTexto(dia, i) {
    var p = dia.paradas[i];
    if (i === 0) return p.chegadaOrigem ? fmtTrecho(p.chegadaOrigem) : "";
    var l = dia.paradas[i - 1].trechoAteProximo;
    return l ? fmtTrecho(l) : "";
  }

  /* Distância/tempo aproximados até a próxima parada relevante do dia,
     somando os trechos e ignorando eventuais paradas opcionais puladas. */
  function metaProxParada(dia, prox) {
    if (prox === 0) {
      var c = dia.paradas[0].chegadaOrigem;
      return c ? fmtTrecho({ km: c.km, min: c.min }) : "";
    }
    var k = prox - 1;
    while (k > 0 && dia.paradas[k].prioridade === "opcional") k--;
    var km = 0, min = 0, temKm = false;
    for (var i = k; i < prox; i++) {
      var l = dia.paradas[i].trechoAteProximo;
      if (!l) return "";
      if (l.km != null) { km += l.km; temKm = true; }
      if (l.min != null) min += l.min;
    }
    var partes = [];
    if (temKm) partes.push("aprox. " + Math.round(km) + " km");
    if (min) partes.push(fmtMin(min));
    return partes.join(" · ");
  }

  /* --------------------------------------------------------- progresso */

  var PKEY = "romenia2026:progresso:v1";
  var progresso = {
    _ler: function () {
      try { return JSON.parse(localStorage.getItem(PKEY)) || {}; }
      catch (e) { return {}; }
    },
    _gravar: function (o) {
      try { localStorage.setItem(PKEY, JSON.stringify(o)); } catch (e) {}
    },
    concluida: function (diaId, idx) {
      return !!this._ler()[diaId + ":" + idx];
    },
    alternar: function (diaId, idx) {
      var o = this._ler(), k = diaId + ":" + idx;
      if (o[k]) delete o[k]; else o[k] = true;
      this._gravar(o);
      return !!o[k];
    },
    /* O progresso do dia considera só as paradas do roteiro principal —
       paradas opcionais não entram na contagem nem "travam" o dia. */
    contarDia: function (dia) {
      var o = this._ler(), feitas = 0, total = 0;
      dia.paradas.forEach(function (p, i) {
        if (p.prioridade === "opcional") return;
        total++;
        if (o[dia.id + ":" + i]) feitas++;
      });
      return { feitas: feitas, total: total };
    },
    /* Próxima parada relevante: a primeira do roteiro principal ainda não
       concluída. Paradas opcionais são puladas neste fluxo (continuam
       visíveis e acessíveis na tela do dia). */
    proximaParada: function (dia) {
      for (var i = 0; i < dia.paradas.length; i++) {
        if (dia.paradas[i].prioridade === "opcional") continue;
        if (!this.concluida(dia.id, i)) return i;
      }
      return -1;
    }
  };

  /* ------------------------------------------------------------- ícones */

  var ICON = {
    hoje: svg('<path d="M4 10.5 12 4l8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
    roteiro: svg('<circle cx="6" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v8"/><path d="M11 6h9"/><path d="M11 18h9"/><path d="M11 12h6"/>'),
    mapa: svg('<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/>'),
    viagem: svg('<path d="M5 20h14"/><path d="M7 16V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9"/><path d="M4 16h16v0a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M10 5V3h4v2"/>'),
    pin: svg('<path d="M12 21s7-5.5 7-12a7 7 0 0 0-14 0c0 6.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>'),
    phone: svg('<path d="M15.5 21C7.5 21 3 16.5 3 8.5 3 6 4 5 5.5 4.5L8 4l1.5 4L8 10c.8 2 3 4.2 5 5l2-1.5 4 1.5-.5 2.5C18 20 17 21 15.5 21Z"/>'),
    external: svg('<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>'),
    check: svg('<path d="m5 13 4 4 10-10"/>'),
    chevron: svg('<path d="m9 6 6 6-6 6"/>'),
    seta: svg('<path d="M12 5v14"/><path d="m6 13 6 6 6-6"/>'),
    setaCanto: svg('<path d="M7 17 17 7"/><path d="M8 7h9v9"/>'),
    recolher: svg('<path d="M9 5v4H5"/><path d="M15 19v-4h4"/><path d="M19 9h-4V5"/><path d="M5 15h4v4"/>'),
    carro: svg('<path d="M5 16v3M19 16v3"/><path d="M4 16h16l-1.5-6.5a2 2 0 0 0-2-1.5H7.5a2 2 0 0 0-2 1.5L4 16Z"/><path d="M6.5 12h11"/><circle cx="8" cy="16" r="1.2"/><circle cx="16" cy="16" r="1.2"/>'),
    aviao: svg('<path d="M10 4.5 4 12l1 3 4-1 2 4 2-1-1-4 5-1 2-3-3 1-2-4-1 1 1 3-4 1-1-4Z"/>'),
    cama: svg('<path d="M4 18V7"/><path d="M4 12h16v6"/><path d="M4 12V9a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v3"/><path d="M20 18v-4"/>'),
    relogio: svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 2"/>'),
    andar: svg('<circle cx="13" cy="4.5" r="1.6"/><path d="m11 21 2-6-2-2V9l4-2 2 3"/><path d="m13 13 3 2 1 4"/><path d="m11 13-2 3-3 1"/>'),
    dirigir: svg('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.2"/><path d="M12 4v6M4.5 15l5.5-2M19.5 15 14 13"/>'),
    info: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.6" fill="currentColor"/>'),
    alerta: svg('<path d="M12 4 3 19h18L12 4Z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/>')
  };
  function svg(inner) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + inner + "</svg>";
  }

  /* ================================================= componentes (HTML) */

  function botao(o) {
    var tag = o.href ? "a" : "button";
    var attrs = o.href
      ? 'href="' + esc(o.href) + '"' + (o.externo ? ' target="_blank" rel="noopener"' : "")
      : 'type="button"';
    if (o.dataset) {
      Object.keys(o.dataset).forEach(function (k) {
        attrs += " data-" + k + '="' + esc(o.dataset[k]) + '"';
      });
    }
    var cls = "botao botao--" + (o.variante || "secundario") +
      (o.grande ? " botao--grande" : "");
    return "<" + tag + ' class="' + cls + '" ' + attrs + ">" +
      (o.icone ? '<span class="botao__icone">' + o.icone + "</span>" : "") +
      "<span>" + esc(o.label) + "</span>" +
      (o.href && o.externo ? '<span class="botao__icone botao__icone--fim">' + ICON.external + "</span>" : "") +
      "</" + tag + ">";
  }

  function seloHtml(selo) {
    return '<span class="selo selo--' + (selo.tom || "info") + '">' + esc(selo.texto) + "</span>";
  }
  function selosHtml(selos) {
    if (!selos || !selos.length) return "";
    return '<p class="selos">' + selos.map(seloHtml).join("") + "</p>";
  }

  function tagPrioridade(p) {
    var map = {
      essencial: ["prioritaria", "Prioritária"],
      recomendada: ["rec", "Se der tempo"],
      opcional: ["opc", "Opcional"]
    };
    var t = map[p];
    return t ? '<span class="tag tag--' + t[0] + '">' + t[1] + "</span>" : "";
  }

  function avisoHtml(texto, tom, link, linkLabel) {
    return '<aside class="aviso aviso--' + (tom || "info") + '" role="note">' +
      '<span class="aviso__icone">' + (tom === "alerta" ? ICON.alerta : ICON.info) + "</span>" +
      "<div><p>" + esc(texto) + "</p>" +
      (link ? '<p><a href="' + esc(link) + '" target="_blank" rel="noopener">' +
        esc(linkLabel || "Saber mais") + "</a></p>" : "") +
      "</div></aside>";
  }

  function barraProgresso(feitas, total) {
    if (total < 2) return "";
    var pct = Math.round((feitas / total) * 100);
    return '<div class="progresso">' +
      '<div class="progresso__texto">' + feitas + " de " + total + " paradas</div>" +
      '<div class="progresso__trilho" role="progressbar" aria-valuemin="0" ' +
      'aria-valuemax="' + total + '" aria-valuenow="' + feitas + '" ' +
      'aria-label="Progresso do dia: ' + feitas + " de " + total + ' paradas">' +
      '<span style="width:' + pct + '%"></span></div></div>';
  }

  function listaHtml(itens, titulo) {
    if (!itens || !itens.length) return "";
    return '<div class="nao-perder"><p class="nao-perder__titulo">' + esc(titulo) + "</p><ul>" +
      itens.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") +
      "</ul></div>";
  }
  function naoPerderHtml(itens) { return listaHtml(itens, "Não perder"); }

  /* Bloco "PRÓXIMO DESTINO" ao pé de uma parada.
     O botão abre a PÁGINA DE DETALHES da próxima parada (não o mapa) —
     de lá o usuário abre o Google Maps se quiser dirigir. */
  function proximoDestino(dia, n, idx) {
    var parada = dia.paradas[idx];
    var prox = dia.paradas[idx + 1];

    if (prox) {
      var meta = fmtTrecho(parada.trechoAteProximo);
      if (prox.prioridade === "opcional")
        meta = (meta ? meta + " · " : "") + "parada opcional";
      return '<section class="proximo-destino">' +
        '<p class="rotulo-secao">Próximo destino</p>' +
        '<p class="proximo-destino__nome">' + esc(prox.nomePt) + "</p>" +
        (prox.local && prox.local !== prox.nomePt
          ? '<p class="proximo-destino__sub">' + esc(prox.local) + "</p>" : "") +
        (meta ? '<p class="proximo-destino__meta">' + esc(meta) + "</p>" : "") +
        botao({ href: "#/dia/" + n + "/parada/" + (idx + 1), label: "Ver próximo destino",
          variante: "primario", grande: true, icone: ICON.seta }) +
        "</section>";
    }

    if (dia.hospedagem) {
      return '<section class="proximo-destino">' +
        '<p class="rotulo-secao">No fim do dia</p>' +
        '<p class="proximo-destino__nome">Sua hospedagem em ' + esc(dia.hospedagem.cidade) + "</p>" +
        botao({ href: "#/dia/" + n, label: "Ver a hospedagem", variante: "primario",
          grande: true, icone: ICON.cama }) +
        "</section>";
    }

    return "";
  }

  function botaoMarcar(dia, idx, grande) {
    var feita = progresso.concluida(dia.id, idx);
    return '<button type="button" class="marcar' + (feita ? " marcar--feita" : "") +
      (grande ? " marcar--grande" : "") + '" data-dia="' + dia.id + '" data-idx="' + idx +
      '" aria-pressed="' + feita + '">' +
      '<span class="marcar__caixa">' + (feita ? ICON.check : "") + "</span>" +
      "<span>" + (feita ? "Parada concluída" : "Marcar como concluída") + "</span></button>";
  }

  function cartaoHospedagem(hosp, comRotulo) {
    var pend = isPendente(hosp.nome);
    var noites = hosp.noites === 1 ? "1 noite" : hosp.noites + " noites";
    var cab = comRotulo ? '<p class="rotulo-secao">Sua hospedagem</p>' : "";

    if (pend) {
      return '<div class="cartao cartao--hotel">' + cab +
        '<p class="hotel__cidade">' + esc(hosp.cidade) + "</p>" +
        '<p class="hotel__noites">' + noites + "</p>" +
        '<div class="pendente"><p class="pendente__titulo">Reserva ainda não adicionada</p>' +
        '<p class="pendente__nota">Nome, endereço, telefone e link da reserva entram aqui assim que forem confirmados.</p></div>' +
        "</div>";
    }

    var linhas = "";
    if (!isPendente(hosp.endereco))
      linhas += '<p class="hotel__linha">' + ICON.pin + "<span>" + esc(hosp.endereco) + "</span></p>";
    if (!isPendente(hosp.checkin))
      linhas += '<p class="hotel__linha">' + ICON.relogio + "<span>Check-in: " + esc(hosp.checkin) + "</span></p>";
    if (!isPendente(hosp.telefone))
      linhas += '<p class="hotel__linha">' + ICON.phone + "<span>" + esc(hosp.telefone) + "</span></p>";

    var acoes = [];
    if (window.Maps.temCoords(hosp.coords))
      acoes.push(botao({ href: window.Maps.rota(hosp.coords, "driving"), label: "Ir para o hotel",
        variante: "primario", grande: true, icone: ICON.dirigir }));
    if (!isPendente(hosp.telefone))
      acoes.push(botao({ href: "tel:" + soDigitos(hosp.telefone), label: "Ligar", icone: ICON.phone }));
    if (hosp.reservaUrl)
      acoes.push(botao({ href: hosp.reservaUrl, label: "Ver reserva", externo: true }));

    return '<div class="cartao cartao--hotel">' + cab +
      "<h3>" + esc(hosp.nome) + "</h3>" +
      '<p class="hotel__cidade">' + esc(hosp.cidade) + " · " + noites + "</p>" +
      linhas +
      (hosp.observacao ? '<p class="nota">' + esc(hosp.observacao) + "</p>" : "") +
      (acoes.length ? '<div class="acoes">' + acoes.join("") + "</div>" : "") +
      (!window.Maps.temCoords(hosp.coords)
        ? '<p class="pendente__nota">Localização no mapa ainda não adicionada.</p>' : "") +
      "</div>";
  }

  function cartaoVoo() {
    var v = DATA.voo;
    return '<div class="cartao cartao--voo">' +
      '<p class="voo__selo">' + ICON.aviao + " Voo às " + esc(v.horario) + "</p>" +
      '<p class="voo__data">' + esc(v.dataLabel) + "</p>" +
      "<h3>" + esc(v.aeroporto) + "</h3>" +
      "<p>" + esc(v.cidade) + "</p>" +
      (isPendente(v.numeroVoo) ? "" : '<p class="voo__num">Voo ' + esc(v.numeroVoo) + "</p>") +
      (v.observacao ? '<p class="nota">' + esc(v.observacao) + "</p>" : "") +
      botao({ href: window.Maps.rota(v.coords, "driving"), label: "Ir para o aeroporto",
        variante: "primario", grande: true, icone: ICON.dirigir }) +
      "</div>";
  }

  function cartaoCarro() {
    var c = DATA.carro;
    function val(v, alt) { return isPendente(v) ? '<em class="a-definir">' + (alt || "A definir") + "</em>" : esc(v); }
    function slot(s) {
      return s.dataLabel + " · " +
        (isPendente(s.horario) ? '<em class="a-definir">horário a definir</em>' : esc(s.horario)) +
        " — " + (isPendente(s.local) ? '<em class="a-definir">local a definir</em>' : esc(s.local));
    }
    var acoes = [];
    if (c.reservaUrl) acoes.push(botao({ href: c.reservaUrl, label: "Ver reserva do carro", externo: true }));
    if (!isPendente(c.telefone)) acoes.push(botao({ href: "tel:" + soDigitos(c.telefone), label: "Ligar para a locadora", icone: ICON.phone }));

    return '<div class="cartao cartao--carro">' +
      '<dl class="dados">' +
      "<div><dt>Locadora</dt><dd>" + val(c.locadora) + "</dd></div>" +
      "<div><dt>Retirada</dt><dd>" + slot(c.retirada) + "</dd></div>" +
      "<div><dt>Devolução</dt><dd>" + slot(c.devolucao) + "</dd></div>" +
      "<div><dt>Nº da reserva</dt><dd>" + val(c.reserva) + "</dd></div>" +
      "<div><dt>Telefone</dt><dd>" + val(c.telefone, "—") + "</dd></div>" +
      "</dl>" +
      (c.observacao ? '<p class="nota">' + esc(c.observacao) + "</p>" : "") +
      (acoes.length ? '<div class="acoes">' + acoes.join("") + "</div>" : "") +
      '<p class="pendente__nota">Os dados da locadora entram aqui quando a reserva estiver fechada.</p>' +
      "</div>";
  }

  function fotoUrl(stem) { return stem ? "assets/images/" + stem + ".webp" : ""; }

  function heroFoto(stem, alt) {
    var url = fotoUrl(stem);
    if (!url) return "";
    return '<div class="hero-foto" role="img" aria-label="Foto: ' + esc(alt) + '" ' +
      'style="background-image:url(' + url + ')"></div>';
  }

  /* Foto que acompanha o mapa: o destino do dia atual (ou o 1º / o último). */
  function fotoDoMapa() {
    var i = fase() === "depois" ? DATA.dias.length - 1
      : fase() === "durante" ? indiceDiaAtual() : 0;
    var d = DATA.dias[Math.max(0, i)];
    return d && d.foto ? d.foto : (DATA.dias[0] && DATA.dias[0].foto) || "";
  }

  function mapaQuadro(variante) {
    var url = fotoUrl(fotoDoMapa());
    return '<div class="mapa-quadro mapa-quadro--' + variante + '">' +
      '<div class="mapa-foto"' + (url ? ' style="background-image:url(' + url + ')"' : "") + "></div>" +
      '<div class="mapa-scrim"></div>' +
      '<div class="mapa-flat"></div>' +
      '<div class="mapa-viewport"><div class="mapa-pan">' +
      window.RomaniaMap.render(DATA.mapa.pontos) +
      "</div></div>" +
      '<div class="mapa-zoom">' +
      '<button type="button" class="mapa-zoom__b" data-zoom="in" aria-label="Aproximar o mapa">+</button>' +
      '<button type="button" class="mapa-zoom__b" data-zoom="out" aria-label="Afastar o mapa">−</button>' +
      '<button type="button" class="mapa-zoom__b mapa-zoom__b--reset" data-zoom="reset" ' +
      'aria-label="Voltar o mapa ao início">' + ICON.recolher + "</button>" +
      "</div>" +
      "</div>";
  }

  function diasCardsHtml() {
    var hAtual = hojeISO();
    return '<ol class="dias-cards">' + DATA.dias.map(function (dia, i) {
      var ehHoje = dia.data === hAtual;
      return "<li>" +
        '<a class="dia-card' + (ehHoje ? " dia-card--hoje" : "") + '" href="#/dia/' + (i + 1) + '">' +
        '<span class="dia-card__meta">Dia ' + (i + 1) + " · " + esc(dia.dataLabel) +
        (ehHoje ? ' · <span class="dia-card__hoje">hoje</span>' : "") + "</span>" +
        '<span class="dia-card__titulo">' + esc(dia.titulo) + "</span>" +
        '<span class="dia-card__seta" aria-hidden="true">' + ICON.setaCanto + "</span>" +
        "</a></li>";
    }).join("") + "</ol>";
  }

  /* ======================================================= TELA: Hoje */

  function viewHoje() {
    var f = fase();

    if (f === "antes") {
      var faltam = diasEntre(hojeISO(), DATA.meta.dataInicio);
      return {
        titulo: "Romênia 2026",
        html:
          '<header class="cabecalho cabecalho--home">' +
          '<p class="sobretitulo">' + esc(DATA.meta.tipo) + "</p>" +
          '<h1 class="titulo-grande">' + esc(DATA.meta.titulo) + "</h1>" +
          '<p class="periodo">' + esc(DATA.meta.periodoLabel) + "</p>" +
          "</header>" +
          '<section class="destaque">' +
          '<p class="destaque__contagem">' +
          (faltam <= 1 ? "Sua viagem começa <strong>amanhã</strong>"
            : "Sua viagem começa em <strong>" + faltam + " dias</strong>") + "</p>" +
          botao({ href: "#/roteiro", label: "Ver o roteiro", variante: "primario", grande: true }) +
          "</section>" +
          '<section class="bloco"><p class="rotulo-secao">A rota</p>' +
          mapaQuadro("home") +
          botao({ href: "#/mapa", label: "Abrir o mapa", icone: ICON.mapa }) + "</section>"
      };
    }

    if (f === "depois") {
      return {
        titulo: "Nossa viagem pela Romênia",
        html:
          '<header class="cabecalho cabecalho--home">' +
          '<p class="sobretitulo">' + esc(DATA.meta.periodoLabel) + "</p>" +
          '<h1 class="titulo-grande">Nossa viagem<br>pela Romênia</h1>' +
          "</header>" +
          '<section class="bloco"><p class="rotulo-secao">O caminho que fizemos</p>' +
          mapaQuadro("home") + "</section>" +
          '<section class="acoes acoes--empilhada">' +
          botao({ href: "#/roteiro", label: "Rever o roteiro", variante: "primario", grande: true, icone: ICON.roteiro }) +
          botao({ href: "#/mapa", label: "Ver o mapa", icone: ICON.mapa }) +
          "</section>"
      };
    }

    /* durante */
    var dia = DATA.dias[indiceDiaAtual()];
    var prox = progresso.proximaParada(dia);
    var cont = progresso.contarDia(dia);
    var ultimo = indiceDiaAtual() === DATA.dias.length - 1;

    var corpo = "";
    corpo +=
      '<header class="cabecalho">' +
      '<p class="sobretitulo">' + saudacao() + "</p>" +
      '<h1 class="titulo-grande">Hoje</h1>' +
      '<p class="subtitulo-dia">' + esc(dia.titulo) + "</p>" +
      '<p class="periodo">' + esc(fmtDataLonga(dia.data)) + " · " +
      dia.paradas.length + (dia.paradas.length === 1 ? " parada" : " paradas") + "</p>" +
      "</header>";

    corpo += selosHtml(dia.selos);
    if (ultimo) corpo += avisoHtml("O voo de volta sai às " + DATA.voo.horario +
      ". Deixe margem folgada para a estrada e o aeroporto.", "alerta");

    if (prox !== -1) {
      var p = dia.paradas[prox];
      var metaDist = metaProxParada(dia, prox);
      corpo +=
        '<section class="destaque">' +
        '<p class="rotulo-secao">Próxima parada</p>' +
        '<p class="destaque__lugar">' + esc(p.nomePt) + "</p>" +
        '<p class="destaque__meta">' + ICON.pin + "<span>" + esc(p.local) +
        (metaDist ? " · " + esc(metaDist) : "") + "</span></p>" +
        botao({ href: "#/dia/" + (indiceDiaAtual() + 1) + "/parada/" + prox,
          label: "Continuar viagem", variante: "primario", grande: true, icone: ICON.seta }) +
        botao({ href: window.Maps.rota(p.coords, p.modo), label: "Abrir rota no Google Maps",
          icone: p.modo === "walking" ? ICON.andar : ICON.dirigir }) +
        "</section>";
    } else {
      corpo +=
        '<section class="destaque destaque--calmo">' +
        '<p class="destaque__lugar">Dia concluído</p>' +
        "<p>Vocês marcaram todas as paradas de hoje.</p>" +
        (dia.hospedagem ? botao({ href: "#/dia/" + (indiceDiaAtual() + 1),
          label: "Ver a hospedagem", icone: ICON.cama }) : "") +
        "</section>";
    }

    corpo += barraProgresso(cont.feitas, cont.total);

    if (dia.hospedagem) {
      corpo += '<section class="bloco"><p class="rotulo-secao">No fim do dia</p>' +
        cartaoHospedagem(dia.hospedagem, false) + "</section>";
    }
    if (ultimo) {
      corpo += '<section class="bloco"><p class="rotulo-secao">Volta para casa</p>' + cartaoVoo() + "</section>";
    }

    corpo += '<p class="link-linha">' +
      '<a href="#/dia/' + (indiceDiaAtual() + 1) + '">Ver o dia completo</a></p>';

    return { titulo: "Hoje — " + dia.titulo, html: corpo };
  }

  /* ==================================================== TELA: Roteiro */

  function viewRoteiro() {
    var hAtual = hojeISO();
    var itens = DATA.dias.map(function (dia, i) {
      var cont = progresso.contarDia(dia);
      var ehHoje = dia.data === hAtual;
      var progtxt = cont.feitas > 0
        ? " · " + cont.feitas + "/" + cont.total + " concluídas" : "";
      return "<li>" +
        '<a class="cartao cartao--dia' + (ehHoje ? " cartao--dia-hoje" : "") + '" href="#/dia/' + (i + 1) + '"' +
        (ehHoje ? ' aria-current="date"' : "") + ">" +
        '<div class="cartao--dia__topo">' +
        '<p class="cartao--dia__data">' + esc(dia.dataLabel) + " · " + esc(fmtDiaSemana(dia.data)) +
        (ehHoje ? ' <span class="etiqueta-hoje">Hoje</span>' : "") + "</p>" +
        '<span class="cartao--dia__chevron">' + ICON.chevron + "</span>" +
        "</div>" +
        "<h2>" + esc(dia.titulo) + "</h2>" +
        '<p class="cartao--dia__meta">' +
        dia.paradas.length + (dia.paradas.length === 1 ? " parada" : " paradas") + progtxt + "</p>" +
        selosHtml(dia.selos) +
        "</a></li>";
    }).join("");

    return {
      titulo: "Roteiro",
      html:
        '<header class="cabecalho"><h1 class="titulo-grande">Roteiro</h1>' +
        '<p class="periodo">' + DATA.dias.length + " dias · " + esc(DATA.meta.periodoLabel) + "</p></header>" +
        '<ol class="lista-dias">' + itens + "</ol>"
    };
  }

  /* ======================================================= TELA: Dia */

  function viewDia(n) {
    var dia = DATA.dias[n - 1];
    if (!dia) return viewNaoEncontrada();
    var cont = progresso.contarDia(dia);

    var timeline = dia.paradas.map(function (p, i) {
      var feita = progresso.concluida(dia.id, i);
      var cheg = chegadaTexto(dia, i);
      return '<li class="timeline__item' + (feita ? " timeline__item--feita" : "") + '">' +
        '<div class="timeline__marca" aria-hidden="true">' +
        (feita ? '<span class="timeline__check">' + ICON.check + "</span>" : (i + 1)) + "</div>" +
        '<article class="cartao cartao--parada">' +
        '<div class="parada__cab">' +
        '<p class="parada__num">Parada ' + (i + 1) + "</p>" + tagPrioridade(p.prioridade) +
        "</div>" +
        "<h2>" + esc(p.nomePt) + "</h2>" +
        (p.nome && p.nome !== p.nomePt ? '<p class="parada__oficial">' + esc(p.nome) + "</p>" : "") +
        '<p class="parada__local">' + ICON.pin + "<span>" + esc(p.local) + "</span></p>" +
        (cheg ? '<p class="parada__trecho">' + (p.modo === "walking" ? ICON.andar : ICON.dirigir) +
          "<span>Trajeto: " + esc(cheg) + "</span></p>" : "") +
        '<p class="parada__desc">' + esc(primeiraFrase(p.descricao)) + "</p>" +
        (p.tempoSugerido && p.tempoSugerido !== "—"
          ? '<p class="parada__tempo">' + ICON.relogio + "<span>Tempo sugerido: " + esc(p.tempoSugerido) + "</span></p>" : "") +
        '<div class="acoes">' +
        botao({ href: "#/dia/" + n + "/parada/" + i, label: "Ver esta parada",
          variante: "secundario" }) +
        "</div>" +
        botaoMarcar(dia, i, false) +
        "</article></li>";
    }).join("");

    var extra = "";
    if (dia.hospedagem)
      extra += '<section class="bloco" id="hospedagem"><p class="rotulo-secao">Sua hospedagem</p>' +
        cartaoHospedagem(dia.hospedagem, false) + "</section>";
    if (n === DATA.dias.length)
      extra += '<section class="bloco"><p class="rotulo-secao">Volta para casa</p>' + cartaoVoo() + "</section>";

    return {
      titulo: dia.titulo,
      html:
        '<p class="migalha"><a href="#/roteiro">' + ICON.chevron + " Roteiro</a></p>" +
        heroFoto(dia.foto, dia.titulo) +
        '<header class="cabecalho">' +
        '<p class="sobretitulo">' + esc(dia.dataLabel) + " · " + esc(fmtDiaSemana(dia.data)) + "</p>" +
        '<h1 class="titulo-grande">' + esc(dia.titulo) + "</h1>" +
        '<p class="resumo">' + esc(dia.resumo) + "</p>" +
        selosHtml(dia.selos) +
        (dia.avisoEstrada ? avisoHtml(dia.avisoEstrada, "alerta", dia.avisoEstradaUrl, "Sobre a estrada") : "") +
        "</header>" +
        barraProgresso(cont.feitas, cont.total) +
        '<ol class="timeline">' + timeline + "</ol>" +
        extra
    };
  }

  /* ==================================================== TELA: Parada */

  function viewParada(n, i) {
    var dia = DATA.dias[n - 1];
    if (!dia || !dia.paradas[i]) return viewNaoEncontrada();
    var p = dia.paradas[i];
    var cheg = chegadaTexto(dia, i);

    var acoes = "";
    if (window.Maps.temCoords(p.coords))
      acoes += botao({ href: window.Maps.rota(p.coords, p.modo),
        label: "Abrir no Google Maps", variante: "primario", grande: true,
        icone: p.modo === "walking" ? ICON.andar : ICON.dirigir });
    if (p.siteUrl)
      acoes += botao({ href: p.siteUrl, label: p.ingressoUrl ? "Site oficial" : "Site / ingressos", externo: true });
    if (p.ingressoUrl)
      acoes += botao({ href: p.ingressoUrl, label: "Comprar ingresso", externo: true });

    return {
      titulo: p.nomePt,
      html:
        '<p class="migalha"><a href="#/dia/' + n + '">' + ICON.chevron + " " + esc(dia.titulo) + "</a></p>" +
        heroFoto(p.foto || dia.foto, p.nomePt) +
        '<article class="parada-detalhe">' +
        '<p class="parada__num">Parada ' + (i + 1) + " de " + dia.paradas.length + " · " + esc(dia.dataLabel) + "</p>" +
        '<h1 class="titulo-grande">' + esc(p.nomePt) + "</h1>" +
        (p.nome && p.nome !== p.nomePt ? '<p class="parada__oficial">' + esc(p.nome) + "</p>" : "") +
        '<p class="parada__local">' + ICON.pin + "<span>" + esc(p.local) + "</span></p>" +
        '<p class="selos">' + tagPrioridade(p.prioridade) + "</p>" +
        (cheg ? '<p class="parada__trecho">' + (p.modo === "walking" ? ICON.andar : ICON.dirigir) +
          "<span>Trajeto: " + esc(cheg) + "</span></p>" : "") +
        '<div class="acoes acoes--empilhada">' + acoes + "</div>" +
        '<p class="parada__desc parada__desc--completa">' + esc(p.descricao) + "</p>" +
        naoPerderHtml(p.naoPerder) +
        listaHtml(p.dicas, "Dicas") +
        (p.tempoSugerido && p.tempoSugerido !== "—"
          ? '<p class="parada__tempo">' + ICON.relogio + "<span>Tempo sugerido: " + esc(p.tempoSugerido) + "</span></p>" : "") +
        (p.observacao ? avisoHtml(p.observacao, "info") : "") +
        botaoMarcar(dia, i, true) +
        proximoDestino(dia, n, i) +
        (i === dia.paradas.length - 1 && !dia.hospedagem && p.aeroporto
          ? '<p class="fim-viagem">Fim da road trip. Boa viagem de volta! ✈️</p>' : "") +
        "</article>"
    };
  }

  /* ====================================================== TELA: Mapa */

  function viewMapa() {
    return {
      titulo: "Nossa rota",
      html:
        '<header class="cabecalho"><h1 class="titulo-grande">Nossa rota</h1>' +
        '<p class="periodo">' + DATA.dias.length + " dias · " + esc(DATA.meta.periodoLabel) +
        " · toque num ponto para abrir o dia</p></header>" +
        mapaQuadro("tela") +
        '<section class="bloco"><p class="rotulo-secao">Os dias</p>' +
        diasCardsHtml() + "</section>"
    };
  }

  /* ==================================================== TELA: Viagem */

  function viewViagem() {
    var estadias = "";
    DATA.dias.forEach(function (dia) {
      if (dia.hospedagem && !dia.hospedagem.continuacao)
        estadias += cartaoHospedagem(dia.hospedagem, false);
    });

    var infos = '<dl class="dados dados--info">' + DATA.informacoes.map(function (it) {
      var dd = it.tel
        ? '<a href="tel:' + soDigitos(it.tel) + '">' + esc(it.valor) + "</a>"
        : esc(it.valor);
      return "<div><dt>" + esc(it.rotulo) + "</dt><dd>" + dd + "</dd></div>";
    }).join("") + "</dl>";

    return {
      titulo: "Viagem",
      html:
        '<header class="cabecalho"><h1 class="titulo-grande">Viagem</h1></header>' +
        '<section class="bloco"><p class="rotulo-secao">Hospedagens</p>' + estadias + "</section>" +
        '<section class="bloco"><p class="rotulo-secao">Carro</p>' + cartaoCarro() + "</section>" +
        '<section class="bloco"><p class="rotulo-secao">Voo de volta</p>' + cartaoVoo() + "</section>" +
        '<section class="bloco"><p class="rotulo-secao">Informações úteis</p>' + infos + "</section>"
    };
  }

  function viewNaoEncontrada() {
    return {
      titulo: "Não encontrado",
      html: '<header class="cabecalho"><h1 class="titulo-grande">Página não encontrada</h1>' +
        "<p class=\"resumo\">Esse endereço não faz parte do guia.</p></header>" +
        botao({ href: "#/", label: "Voltar ao início", variante: "primario", grande: true })
    };
  }

  /* --------------------------------------------------------- utilit. */

  function primeiraFrase(t) {
    /* Primeira frase — sem quebrar em ponto entre dígitos (ex.: "2.034 m"). */
    var m = String(t).match(/^[\s\S]*?[.!?](?=\s|$)/);
    return m ? m[0].trim() : t;
  }

  /* ==================================================== roteamento */

  function parseHash() {
    var raw = location.hash.replace(/^#\/?/, "");
    var seg = raw.split("/").filter(Boolean);
    if (!seg.length) return { view: "hoje", nav: "hoje" };
    if (seg[0] === "roteiro") return { view: "roteiro", nav: "roteiro" };
    if (seg[0] === "mapa") return { view: "mapa", nav: "mapa" };
    if (seg[0] === "viagem") return { view: "viagem", nav: "viagem" };
    if (seg[0] === "dia" && seg[1]) {
      var n = parseInt(seg[1], 10);
      if (seg[2] === "parada" && seg[3] != null)
        return { view: "parada", nav: "roteiro", n: n, i: parseInt(seg[3], 10) };
      return { view: "dia", nav: "roteiro", n: n };
    }
    return { view: "hoje", nav: "hoje" };
  }

  function render() {
    if (!DATA) {
      main.innerHTML = '<p class="aviso aviso--alerta">Não foi possível carregar o roteiro.</p>';
      return;
    }
    var r = parseHash();
    var saida;
    switch (r.view) {
      case "roteiro": saida = viewRoteiro(); break;
      case "dia": saida = viewDia(r.n); break;
      case "parada": saida = viewParada(r.n, r.i); break;
      case "mapa": saida = viewMapa(); break;
      case "viagem": saida = viewViagem(); break;
      default: saida = viewHoje();
    }

    var manterScroll = window._manterScroll;
    var y = window.scrollY;

    main.innerHTML = '<div class="tela" tabindex="-1">' + saida.html + "</div>";
    document.title = /Romênia 2026/.test(saida.titulo)
      ? saida.titulo : saida.titulo + " · Romênia 2026";

    qsa(".nav__item").forEach(function (a) {
      var ativo = a.getAttribute("data-nav") === r.nav;
      a.classList.toggle("nav__item--ativo", ativo);
      if (ativo) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    if (r.view === "mapa" || r.view === "hoje") ligarMapa();
    if (r.view === "mapa") {
      var quadro = qs(".mapa-quadro");
      if (quadro && window.MapaInterativo) window.MapaInterativo(quadro);
    }

    if (manterScroll) {
      window.scrollTo(0, y);
      window._manterScroll = false;
    } else {
      window.scrollTo(0, 0);
      var tela = qs(".tela");
      if (tela) tela.focus({ preventScroll: true });
      if (vivo) vivo.textContent = saida.titulo;
    }
  }

  function ligarMapa() {
    qsa(".mapa-ponto").forEach(function (g) {
      function ir() { location.hash = "#/dia/" + g.getAttribute("data-dia"); }
      g.addEventListener("click", ir);
      g.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ir(); }
      });
    });
  }

  /* ------------------------------------------------- ações delegadas */

  main.addEventListener("click", function (e) {
    var btn = e.target.closest(".marcar");
    if (btn) {
      var d = btn.getAttribute("data-dia"), ix = btn.getAttribute("data-idx");
      progresso.alternar(d, parseInt(ix, 10));
      window._manterScroll = true;
      render();
      var novo = qs('.marcar[data-dia="' + d + '"][data-idx="' + ix + '"]');
      if (novo) novo.focus();
    }
  });

  /* ------------------------------------------------------ navegação */

  window.addEventListener("hashchange", render);

  /* injeta ícones na barra de navegação */
  function montarNav() {
    var map = { hoje: ICON.hoje, roteiro: ICON.roteiro, mapa: ICON.mapa, viagem: ICON.viagem };
    qsa(".nav__item").forEach(function (a) {
      var k = a.getAttribute("data-nav");
      if (map[k]) a.insertAdjacentHTML("afterbegin", '<span class="nav__icone">' + map[k] + "</span>");
    });
  }

  /* ==================================== Service Worker + atualização */

  function registrarSW() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("service-worker.js").then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) mostrarBannerAtualizacao(reg);
      reg.addEventListener("updatefound", function () {
        var novo = reg.installing;
        if (!novo) return;
        novo.addEventListener("statechange", function () {
          if (novo.state === "installed" && navigator.serviceWorker.controller)
            mostrarBannerAtualizacao(reg);
        });
      });
    }).catch(function () {});

    var recarregou = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (recarregou) return;
      recarregou = true;
      window.location.reload();
    });

    /* Ao reabrir o app (voltar do Google Maps, destravar o celular),
       procura uma versão nova publicada no GitHub Pages. */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) return;
      navigator.serviceWorker.getRegistration().then(function (reg) {
        if (reg) reg.update();
      });
    });
  }

  function mostrarBannerAtualizacao(reg) {
    var banner = document.getElementById("atualizacao");
    if (!banner) return;
    banner.hidden = false;
    var botaoAtu = document.getElementById("btn-atualizar");
    botaoAtu.onclick = function () {
      botaoAtu.disabled = true;
      botaoAtu.textContent = "Atualizando…";
      if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
      else window.location.reload();
    };
  }

  /* ============================================ convite de instalação */

  function configurarInstalacao() {
    var KEY = "romenia2026:instalar-oculto";
    var banner = document.getElementById("instalar");
    var texto = document.getElementById("instalar-texto");
    var btnAcao = document.getElementById("btn-instalar");
    var btnFechar = document.getElementById("btn-instalar-fechar");
    if (!banner) return;

    var jaInstalado =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
    if (jaInstalado) return;

    try { if (localStorage.getItem(KEY) === "1") return; } catch (e) {}

    var dispensado = false;
    function mostrar() {
      if (dispensado) return;
      banner.hidden = false;
      document.body.classList.add("tem-instalar");
    }
    function fechar(lembrar) {
      dispensado = true;
      banner.hidden = true;
      document.body.classList.remove("tem-instalar");
      if (lembrar !== false) { try { localStorage.setItem(KEY, "1"); } catch (e) {} }
    }
    btnFechar.addEventListener("click", function () { fechar(true); });

    /* Android / Chrome / Edge — prompt nativo */
    var promptAdiado = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      promptAdiado = e;
      texto.textContent = "Adicione o guia à tela inicial do celular.";
      btnAcao.hidden = false;
      mostrar();
    });
    btnAcao.addEventListener("click", function () {
      if (!promptAdiado) return;
      promptAdiado.prompt();
      var p = promptAdiado.userChoice;
      promptAdiado = null;
      (p && p.then ? p : Promise.resolve()).then(function () { fechar(true); });
    });
    window.addEventListener("appinstalled", function () { fechar(true); });

    /* iPhone / iPad no Safari — sem API, mostra a instrução */
    var ua = navigator.userAgent;
    var ehIOS = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var ehSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome|Android/.test(ua);
    if (ehIOS && ehSafari) {
      texto.innerHTML =
        'Para instalar: toque em <strong>Compartilhar</strong> e depois em ' +
        '<strong>“Adicionar à Tela de Início”</strong>.';
      btnAcao.hidden = true;
      setTimeout(mostrar, 1500);
    }
  }

  /* =========================================================== init */

  montarNav();
  render();
  registrarSW();
  configurarInstalacao();
})();
