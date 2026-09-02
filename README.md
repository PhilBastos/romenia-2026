# Romênia 2026

Guia pessoal de viagem para a road trip pela Romênia, **25 a 30 de setembro
de 2026**. É um aplicativo web (PWA) que funciona no celular, pode ser
instalado na tela inicial e continua mostrando o roteiro mesmo sem internet.

A pergunta que o app responde o tempo todo é: **onde estamos e para onde
vamos agora?**

- **Hoje** — o dia atual, a próxima parada e o botão para abrir a rota.
- **Roteiro** — os 6 dias, cada um com sua sequência de paradas.
- **Mapa** — a rota inteira num mapa estilizado da Romênia.
- **Viagem** — hospedagens, carro, voo de volta e informações úteis.

---

## Como testar no computador

Não precisa instalar nada. Abra um terminal na pasta do projeto e rode um
servidor local simples:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

> Abrir o `index.html` com dois cliques (protocolo `file://`) **não
> funciona** por causa das regras de segurança do navegador. Use sempre um
> servidor local ou o GitHub Pages.

### Simular uma data (para conferir cada dia)

Acrescente `?hoje=AAAA-MM-DD` ao endereço. Exemplos:

- `http://localhost:8000/?hoje=2026-09-27` — mostra o dia 27 como "hoje".
- `http://localhost:8000/?hoje=2026-09-20` — mostra a contagem regressiva.
- `http://localhost:8000/?hoje=2026-10-05` — mostra o estado "depois da viagem".

Sem esse parâmetro, o app usa a data real do aparelho.

---

## Como editar o roteiro

**Todo o conteúdo da viagem fica em um único arquivo:**

```
data/itinerary.js
```

Você não precisa mexer em mais nada. O arquivo é comentado e tem uma
estrutura repetitiva — copie um bloco parecido e adapte.

### Onde alterar cada coisa

| O que | Onde, em `data/itinerary.js` |
|---|---|
| Datas e título da viagem | objeto `meta` (no topo) |
| Sequência mostrada na Home e no Mapa | `meta.rotaResumo` e `mapa.pontos` |
| Um dia inteiro | um item da lista `dias` |
| Resumo do dia | campo `resumo` do dia |
| Selos do dia ("Dia de estrada" etc.) | campo `selos` do dia |
| Uma parada / atração | um item da lista `paradas` do dia |
| Descrição, "não perder", tempo sugerido | campos `descricao`, `naoPerder`, `tempoSugerido` |
| Prioridade da parada | campo `prioridade`: `"essencial"`, `"recomendada"` ou `"opcional"` |
| Link do site oficial / ingressos | campos `siteUrl` e `ingressoUrl` |
| Distância/tempo até a próxima parada | campo `trechoAteProximo` `{ km, min, nota }` |
| Distância do início do dia até a 1ª parada | campo `chegadaOrigem` da primeira parada |
| **Hotel de uma noite** | campo `hospedagem` do dia |
| Nome, endereço, telefone, check-in do hotel | `hospedagem.nome`, `.endereco`, `.telefone`, `.checkin` |
| Link da reserva do hotel | `hospedagem.reservaUrl` |
| Mapa do hotel (botão "Ir para o hotel") | `hospedagem.coords` = `[latitude, longitude]` |
| **Carro / locadora** | objeto `carro` (perto do fim do arquivo) |
| **Voo de volta** | objeto `voo` |
| Informações úteis (emergência, moeda…) | lista `informacoes` |

### Exemplo: preencher um hotel

Antes (ainda não definido):

```js
hospedagem: {
  cidade: "Sibiu",
  nome: "HOTEL_A_DEFINIR",
  endereco: "ENDERECO_A_DEFINIR",
  checkin: "CHECKIN_A_DEFINIR",
  telefone: "TELEFONE_A_DEFINIR",
  reservaUrl: null,
  coords: null,
  noites: 1,
  continuacao: false,
  observacao: null
}
```

Depois:

```js
hospedagem: {
  cidade: "Sibiu",
  nome: "Hotel Am Ring",
  endereco: "Piața Mare 14, Sibiu",
  checkin: "14:00",
  telefone: "+40 269 206 499",
  reservaUrl: "https://link-da-sua-reserva.com/...",
  coords: [45.7975, 24.1516],
  noites: 1,
  continuacao: false,
  observacao: null
}
```

Enquanto os campos tiverem os textos `..._A_DEFINIR` (ou `null`), o app
mostra **"Reserva ainda não adicionada"** de forma discreta, sem inventar
nada.

### Regras importantes ao editar

- **Coordenadas** são sempre `[latitude, longitude]` (nessa ordem), com
  ponto decimal. Pegue no Google Maps: clique com o botão direito no local
  → o primeiro número é a latitude.
- **Não invente** telefones, endereços ou links. Deixe o placeholder até ter
  a informação real.
- Mantenha as vírgulas e chaves `{ }` como estão. Se o app abrir em branco
  depois de uma edição, provavelmente falta uma vírgula ou uma aspa — o
  console do navegador (F12) aponta a linha.
- Os nomes oficiais romenos (com ș, ț, ă, â) devem ser preservados.

---

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo `romenia-2026`) e envie estes
   arquivos:

   ```bash
   git init
   git add .
   git commit -m "Guia Romênia 2026"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/romenia-2026.git
   git push -u origin main
   ```

2. No GitHub, vá em **Settings → Pages**.
3. Em **Source**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`. Salve.
5. Aguarde 1–2 minutos. O endereço será algo como:

   ```
   https://SEU_USUARIO.github.io/romenia-2026/
   ```

O projeto já inclui um arquivo `.nojekyll` para o GitHub servir os arquivos
como estão.

---

## Como atualizar depois de publicado

Sempre que quiser mudar o roteiro (hotéis, links, horários, paradas):

1. Edite `data/itinerary.js` (ou outro arquivo).
2. **Se você mudou o conteúdo**, abra `service-worker.js` e aumente o número
   da versão:

   ```js
   const CACHE_VERSION = "romenia-2026-v1";   // mude para v2, v3, ...
   ```

   Isso é o que faz o app avisar os viajantes que há novidade.
3. Faça commit e push:

   ```bash
   git add .
   git commit -m "Atualiza hotel de Sibiu"
   git push
   ```

4. Em 1–2 minutos o GitHub Pages publica a nova versão.

### O que os viajantes veem

Da próxima vez que abrirem o app **com internet**, aparece uma faixa no
topo:

> **Roteiro atualizado** — Há novas informações disponíveis. **[ Atualizar
> agora ]**

Ao tocar em "Atualizar agora", o app recarrega já com o conteúdo novo.
Enquanto não tocarem, continuam usando a versão anterior (nada quebra).

O app também procura sozinho por atualizações toda vez que é reaberto
(por exemplo, ao voltar do Google Maps).

---

## Como instalar no celular (PWA)

- **Android (Chrome):** abrir o endereço → menu **⋮** → **Adicionar à tela
  inicial** / **Instalar aplicativo**.
- **iPhone (Safari):** abrir o endereço → botão **Compartilhar** →
  **Adicionar à Tela de Início**.

O app instala com o nome **Romênia**, abre em tela cheia (sem a barra do
navegador) e funciona offline para o roteiro já carregado.

> **Sobre o Google Maps offline:** os botões "Abrir no Google Maps" e "Ir
> para o hotel" abrem o app do Google Maps. Se ele vai funcionar sem
> internet depende dos **mapas offline baixados no próprio celular** — isso
> não faz parte deste guia. Recomenda-se baixar os mapas da Romênia no
> Google Maps antes da viagem.

---

## Estrutura dos arquivos

```
/
├── index.html              Estrutura da página e barra de navegação
├── css/
│   └── style.css           Todo o visual
├── js/
│   ├── app.js              Telas, navegação, progresso, Service Worker
│   ├── maps.js             Monta os links do Google Maps
│   └── map-romania.js      Desenha o mapa da Romênia em SVG
├── data/
│   └── itinerary.js        >>> TODO O CONTEÚDO DA VIAGEM <<<
├── assets/
│   └── icons/              Ícones do app instalado
├── manifest.webmanifest    Configuração do PWA
├── service-worker.js       Cache offline e aviso de atualização
├── .nojekyll               Para o GitHub Pages servir os arquivos como estão
├── DECISOES.md             Por que o app é do jeito que é
└── PROXIMOS-PASSOS.md      Ideias deixadas de fora de propósito
```

## Progresso da viagem

Marcar uma parada como concluída fica salvo **só naquele aparelho**
(`localStorage`). Não sincroniza entre celulares e não impede voltar a
qualquer parada. Para zerar: nas configurações do navegador, limpe os dados
do site.
