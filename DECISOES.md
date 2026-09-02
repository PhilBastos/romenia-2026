# Decisões de projeto — Romênia 2026

Registro curto do que foi decidido e por quê. Não é um diário.

## Produto

- **Problema:** um casal de viajantes mais idosos, brasileiros, faz uma road
  trip de 6 dias pela Romênia e precisa, a cada momento, saber onde está,
  qual é a próxima parada e como chegar lá — com o mínimo de toques e sem
  aprender a navegar por uma interface.
- **Tela inicial = "Hoje".** Durante a viagem ela mostra o dia atual, a
  próxima parada não concluída e dois botões grandes: "Continuar viagem"
  (abre a parada) e "Abrir rota no Google Maps". Antes da viagem: contagem
  regressiva. Depois: retrospecto.
- **Fluxo central:** visitar → voltar ao app → "Continuar viagem" / "Próximo
  destino" → dirigir → repetir. Toda parada termina com um bloco "Próximo
  destino" com distância aproximada e um botão de rota.
- **4 abas apenas:** Hoje, Roteiro, Mapa, Viagem. Sem menus escondidos.

## Escopo — o que NÃO foi incluído (de propósito)

- Sem busca, filtros, paginação ou dashboard: são 6 dias e ~20 paradas,
  tudo cabe na tela.
- Sem login, contas ou backend: é um guia pessoal, hospedado estaticamente.
- Sem edição pelo app: o conteúdo muda editando `data/itinerary.js` e
  publicando de novo (era um requisito).
- Sem promessa de Google Maps offline: o app não controla isso.

## Conteúdo

- Todo conteúdo variável está isolado em `data/itinerary.js`. A interface
  não contém datas, textos de atrações, telefones nem endereços.
- **Placeholders** (`HOTEL_A_DEFINIR`, `TELEFONE_A_DEFINIR`, `null`) são
  detectados pela interface, que mostra "Reserva ainda não adicionada" em
  vez de inventar dados. Hotéis, carro e links de reserva ainda serão
  fornecidos.
- **Paradas opcionais** (`prioridade: "opcional"`, ex.: Cheile Turzii) não
  entram na contagem de progresso e são puladas no fluxo "Continuar viagem"
  — continuam visíveis na tela do dia. Isso mantém o dia confortável, como
  pedido no briefing.
- **Coordenadas** são de pontos de referência conhecidos (castelos, praças,
  o aeroporto), suficientes para o Google Maps apontar o destino certo.
  Podem ser ajustadas com precisão em `data/itinerary.js`.
- **Distâncias e tempos** (`trechoAteProximo`, `chegadaOrigem`) são
  aproximados, para carro, sem trânsito, e estão no arquivo de dados para
  correção fácil. A interface sempre escreve "aprox.".
- **Transfăgărășan:** o dia 30 tem o campo `avisoEstrada` com o alerta
  sazonal e um link. A estrada costuma fechar com a primeira neve.

## Google Maps

- Links no formato *directions* com apenas o `destination` (coordenadas) e
  `travelmode`. A origem é omitida de propósito: o Google Maps usa a
  posição atual do aparelho. Paradas a pé usam `travelmode=walking`.
- Nunca uma busca genérica — sempre coordenadas.

## Técnico

- **HTML + CSS + JavaScript puro, sem build, sem dependências.** Requisito
  do briefing e o mais robusto para GitHub Pages. Nenhuma biblioteca foi
  adicionada.
- **Roteamento por hash** (`#/...`): funciona em GitHub Pages sem
  configuração de servidor e sem quebrar ao recarregar.
- **Mapa da Romênia:** SVG desenhado em `js/map-romania.js`. O contorno do
  país é uma silhueta estilizada (não cartográfica); as cidades são
  projetadas a partir das coordenadas reais. Pontos numerados na ordem da
  viagem, com a legenda logo abaixo — evita rótulos sobrepostos na região
  montanhosa, onde as paradas ficam muito próximas.
- **Tipografia:** serifada do sistema (Georgia) nos títulos, sans do
  sistema no corpo. Nenhuma fonte web — zero download, funciona offline.
- **Ícones:** conjunto próprio de SVGs inline em `js/app.js`. Sem emoji na
  interface.

## PWA e offline

- `manifest.webmanifest` com `start_url` e `scope` relativos (`.`) para
  funcionar em subpasta do GitHub Pages.
- **Service Worker** com versão no nome do cache (`CACHE_VERSION`).
  - HTML e `data/itinerary.js`: **rede primeiro**, cache como reserva — para
    que mudanças de hotéis/reservas apareçam assim que houver internet.
  - CSS, JS e ícones: **cache primeiro**, atualização em segundo plano.
- **Atualização:** ao subir uma versão nova e mudar `CACHE_VERSION`, o app
  detecta o novo Service Worker e mostra a faixa "Roteiro atualizado /
  Atualizar agora". O clique ativa a versão nova e recarrega. Também há
  verificação automática quando o app volta a ficar visível.
- O fluxo completo de atualização (instalar v-nova → faixa → ativar →
  recarregar → apagar cache antigo) foi testado no Chrome.
- Observação: o navegador embutido usado no desenvolvimento bloqueia
  Service Workers; a verificação foi feita no Chrome real e no GitHub Pages
  o comportamento é o padrão.

## Acessibilidade

- Fonte base 17px, alvos de toque ≥ 48px, contraste alto.
- HTML semântico, foco visível, navegação por teclado completa, `Enter`/
  `Espaço` nos pontos do mapa, foco devolvido ao botão certo depois de
  marcar uma parada ou selecionar um ponto.
- `aria-live` anuncia a troca de tela; estados não dependem só de cor
  (ícone + texto em "Concluída", "Prioritária" etc.).
- `prefers-reduced-motion` respeitado.
