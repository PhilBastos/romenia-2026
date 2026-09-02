/*
 * ROMÊNIA 2026 — ARQUIVO CENTRAL DE DADOS
 * =====================================================================
 * TODO o conteúdo variável da viagem está aqui. A interface (js/app.js)
 * nunca contém datas, endereços, telefones ou descrições — só lê este
 * arquivo. Para atualizar a viagem, edite apenas este arquivo e publique.
 *
 * Como editar: veja o README.md ("Como editar o roteiro").
 *
 * Placeholders: valores como HOTEL_A_DEFINIR, TELEFONE_A_DEFINIR ou
 * null indicam informação ainda não confirmada. A interface mostra
 * "Reserva ainda não adicionada" nesses casos — não invente dados.
 *
 * Coordenadas: são de pontos de referência conhecidos (castelos, praças,
 * o aeroporto). Servem para abrir o Google Maps já apontando para o
 * local. Podem ser ajustadas com precisão se necessário.
 *
 * Distâncias e tempos (campo "trechoAteProximo"): são aproximados, para
 * carro, sem trânsito. Sempre confirme o tempo real no Google Maps antes
 * de sair. A estrada Transfăgărășan é sazonal — veja "avisoEstrada".
 * =====================================================================
 */

window.ITINERARY = {
  versaoConteudo: "2026-09-02",

  meta: {
    titulo: "Romênia",
    tipo: "Road Trip",
    periodoLabel: "25 — 30 SET 2026",
    dataInicio: "2026-09-25",
    dataFim: "2026-09-30",
    // Sequência macro exibida na Home e no Mapa.
    rotaResumo: [
      "Bucareste", "Peleș", "Bran", "Brașov",
      "Sighișoara", "Turda", "Sibiu", "Transfăgărășan", "Bucareste"
    ],
    observacaoDados:
      "Distâncias e tempos são aproximados (carro, sem trânsito). " +
      "Horários e preços de atrações podem mudar — confirme nos sites oficiais."
  },

  // Pontos do mapa geral (tela "Nossa rota"). A linha liga os pontos na ordem.
  mapa: {
    pontos: [
      { nome: "Bucareste",              coords: [44.4268, 26.1025], dia: 1 },
      { nome: "Sinaia · Peleș",         coords: [45.3500, 25.5500], dia: 3 },
      { nome: "Bran",                   coords: [45.5149, 25.3672], dia: 3 },
      { nome: "Brașov",                 coords: [45.6427, 25.5887], dia: 3 },
      { nome: "Sighișoara",            coords: [46.2199, 24.7925], dia: 4 },
      { nome: "Turda",                  coords: [46.5875, 23.7869], dia: 5 },
      { nome: "Sibiu",                  coords: [45.7975, 24.1516], dia: 5 },
      { nome: "Transfăgărășan",         coords: [45.6040, 24.6170], dia: 6 },
      { nome: "Aeroporto",              coords: [44.5711, 26.0850], dia: 6, fim: true }
    ]
  },

  dias: [
    /* ------------------------------------------------------------------ */
    {
      id: "25set",
      foto: "bucareste",
      data: "2026-09-25",
      dataLabel: "25 SET",
      origem: "Chegada",
      destino: "Bucareste",
      titulo: "Bucareste",
      resumo:
        "Vocês chegam de madrugada, por volta da 01:30. O dia é curto de " +
        "propósito: descansar pela manhã e conhecer o centro de Bucareste " +
        "com calma à tarde.",
      selos: [{ tom: "aviso", texto: "Chegada 01:30" }],
      paradas: [
        {
          nome: "Centrul Vechi",
          nomePt: "Centro Histórico (Lipscani)",
          local: "Bucareste",
          coords: [44.4319, 26.1010],
          modo: "walking",
          descricao:
            "O coração antigo de Bucareste: ruas de pedra, cafés, livrarias e a " +
            "pequena igreja Stavropoleos, escondida num pátio. Bom para uma " +
            "primeira caminhada sem pressa.",
          naoPerder: [
            "Igreja e pátio Stavropoleos",
            "Rua Lipscani",
            "Pátio do Hanul lui Manuc",
            "Livraria Cărturești Carusel"
          ],
          tempoSugerido: "1h – 1h30",
          prioridade: "essencial",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 1, min: 12, nota: "a pé" }
        },
        {
          nome: "Ateneul Român",
          nomePt: "Ateneu Romeno",
          local: "Bucareste",
          coords: [44.4413, 26.0973],
          modo: "walking",
          descricao:
            "A sala de concertos mais bonita da cidade, em estilo neoclássico, " +
            "diante da Praça da Revolução. Vale ver o exterior e a praça; a " +
            "entrada depende da agenda de concertos.",
          naoPerder: [
            "Fachada e cúpula",
            "Praça George Enescu",
            "Piața Revoluției, ao lado"
          ],
          tempoSugerido: "30 – 45 min",
          prioridade: "recomendada",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.6, min: 9, nota: "a pé" }
        },
        {
          nome: "Grădina Cișmigiu",
          nomePt: "Jardim Cișmigiu",
          local: "Bucareste",
          coords: [44.4362, 26.0885],
          modo: "walking",
          descricao:
            "O parque mais antigo de Bucareste, com lago, caramanchões e " +
            "caminhos planos à sombra. Um bom lugar para encerrar o primeiro " +
            "dia descansando.",
          naoPerder: ["Lago e caramanchões", "Aleias arborizadas"],
          tempoSugerido: "30 – 45 min",
          prioridade: "recomendada",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null
        }
      ],
      hospedagem: {
        cidade: "Bucareste",
        nome: "HOTEL_A_DEFINIR",
        endereco: "ENDERECO_A_DEFINIR",
        checkin: "CHECKIN_A_DEFINIR",
        telefone: "TELEFONE_A_DEFINIR",
        reservaUrl: null,
        coords: null,
        noites: 2,
        continuacao: false,
        observacao: null
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "26set",
      foto: "bucareste",
      data: "2026-09-26",
      dataLabel: "26 SET",
      origem: "Bucareste",
      destino: "Bucareste",
      titulo: "Bucareste",
      resumo:
        "Segundo dia na capital, com tempo para as duas visitas principais " +
        "sem correria: o Palácio do Parlamento pela manhã e o Museu da Aldeia " +
        "à tarde.",
      selos: [],
      paradas: [
        {
          nome: "Palatul Parlamentului",
          nomePt: "Palácio do Parlamento",
          local: "Bucareste",
          coords: [44.4275, 26.0875],
          modo: "driving",
          descricao:
            "O segundo maior edifício administrativo do mundo. A visita é só " +
            "com tour guiado e documento com foto — convém reservar com " +
            "antecedência. Há bastante caminhada e escadas no percurso interno.",
          naoPerder: [
            "Salão dos Direitos Humanos",
            "Varanda com vista sobre o Bulevardul Unirii",
            "Escadaria de mármore"
          ],
          tempoSugerido: "1h30 (tour)",
          prioridade: "essencial",
          observacao:
            "Só com tour guiado, mediante reserva antecipada e documento com " +
            "foto. Procure o site oficial de visitas do Parlamento.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 8, min: 20, nota: "de carro ou táxi" }
        },
        {
          nome: "Muzeul Național al Satului „Dimitrie Gusti”",
          nomePt: "Museu Nacional da Aldeia",
          local: "Bucareste",
          coords: [44.4700, 26.0790],
          modo: "driving",
          descricao:
            "Museu a céu aberto às margens do lago Herăstrău, com casas " +
            "camponesas autênticas trazidas de todas as regiões da Romênia. " +
            "Caminhos planos e arborizados, ritmo tranquilo.",
          naoPerder: [
            "Casas de madeira da Maramureș",
            "Igrejas de madeira",
            "Casas semienterradas do Delta do Danúbio"
          ],
          tempoSugerido: "1h30 – 2h",
          prioridade: "essencial",
          observacao: null,
          siteUrl: "https://muzeul-satului.ro",
          ingressoUrl: null,
          trechoAteProximo: { km: 6, min: 18, nota: "de carro ou táxi" }
        },
        {
          nome: "Calea Victoriei",
          nomePt: "Avenida Victoriei",
          local: "Bucareste",
          coords: [44.4331, 26.1015],
          modo: "walking",
          descricao:
            "A avenida histórica de Bucareste, boa para uma caminhada leve no " +
            "fim da tarde, terminando na livraria Cărturești Carusel, num " +
            "prédio branco restaurado.",
          naoPerder: [
            "Fachadas históricas da avenida",
            "Interior da Cărturești Carusel",
            "Passage Victoria (se aberta)"
          ],
          tempoSugerido: "45 min – 1h",
          prioridade: "opcional",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null
        }
      ],
      hospedagem: {
        cidade: "Bucareste",
        nome: "HOTEL_A_DEFINIR",
        endereco: "ENDERECO_A_DEFINIR",
        checkin: "CHECKIN_A_DEFINIR",
        telefone: "TELEFONE_A_DEFINIR",
        reservaUrl: null,
        coords: null,
        noites: 2,
        continuacao: true,
        observacao: null
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "27set",
      foto: "transilvania",
      data: "2026-09-27",
      dataLabel: "27 SET",
      origem: "Bucareste",
      destino: "Sighișoara",
      titulo: "Bucareste → Sighișoara",
      resumo:
        "Um dos grandes dias de estrada, atravessando os Cárpatos e a " +
        "Transilvânia. Peleș e Bran são as paradas essenciais. Brașov e a " +
        "Igreja Negra podem ser encurtados se o dia atrasar.",
      selos: [
        { tom: "info", texto: "Dia de estrada" },
        { tom: "info", texto: "≈ 5 h ao volante" }
      ],
      paradas: [
        {
          nome: "Castelul Peleș",
          foto: "peles",
          nomePt: "Castelo de Peleș",
          local: "Sinaia",
          coords: [45.3600, 25.5425],
          modo: "driving",
          chegadaOrigem: { km: 125, min: 135, nota: "de Bucareste" },
          descricao:
            "Palácio de verão dos reis da Romênia, encravado na montanha, com " +
            "interiores de madeira entalhada. A visita é guiada e há uma " +
            "subida a pé da estrada até o castelo (cerca de 10 min, em ladeira).",
          naoPerder: [
            "Grande Hall (Hol de Onoare)",
            "Apartamentos reais",
            "Fachada e jardins em terraços",
            "Vista externa com a montanha ao fundo"
          ],
          tempoSugerido: "1h30 – 2h",
          prioridade: "essencial",
          observacao:
            "Costuma fechar às segundas (e, em certos períodos, também às " +
            "terças). Ingressos na bilheteria. Confirme no site oficial.",
          siteUrl: "https://peles.ro",
          ingressoUrl: null,
          trechoAteProximo: { km: 50, min: 75, nota: "via Brașov" }
        },
        {
          nome: "Castelul Bran",
          foto: "transilvania",
          nomePt: "Castelo de Bran",
          local: "Bran",
          coords: [45.5149, 25.3672],
          modo: "driving",
          descricao:
            "O castelo medieval associado ao mito do Drácula, sobre um " +
            "rochedo. Interiores em estilo enxaimel, com escadas estreitas e " +
            "alguns degraus irregulares.",
          naoPerder: [
            "Pátio interno",
            "Aposentos da rainha Maria",
            "Passagem secreta (escada estreita)",
            "Vista do castelo desde o jardim"
          ],
          tempoSugerido: "1h – 1h30",
          prioridade: "essencial",
          observacao:
            "A bilheteria fecha antes do castelo. Pode haver fila; degraus " +
            "estreitos no interior.",
          siteUrl: "https://bran-castle.com",
          ingressoUrl: null,
          trechoAteProximo: { km: 28, min: 40, nota: null }
        },
        {
          nome: "Piața Sfatului",
          foto: "brasov",
          nomePt: "Brașov — Praça do Conselho",
          local: "Brașov",
          coords: [45.6427, 25.5887],
          modo: "driving",
          descricao:
            "Cidade saxã aos pés da montanha Tâmpa. A praça central, colorida, " +
            "é boa para um almoço tardio ou um café antes de seguir viagem.",
          naoPerder: [
            "Praça do Conselho (Piața Sfatului)",
            "Casa do Conselho (Casa Sfatului)",
            "Rua Republicii",
            "Letreiro BRAȘOV na montanha, ao longe"
          ],
          tempoSugerido: "45 min – 1h",
          prioridade: "recomendada",
          observacao: "Pode ser encurtada se o dia estiver atrasado.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.3, min: 4, nota: "a pé" }
        },
        {
          nome: "Biserica Neagră",
          foto: "brasov",
          nomePt: "Igreja Negra",
          local: "Brașov",
          coords: [45.6410, 25.5876],
          modo: "walking",
          descricao:
            "A maior igreja gótica entre Viena e Istambul, com o exterior " +
            "escurecido por um incêndio no século XVII. Guarda uma grande " +
            "coleção de tapetes orientais.",
          naoPerder: [
            "Nave gótica",
            "Órgão Buchholz",
            "Coleção de tapetes anatólios"
          ],
          tempoSugerido: "30 – 45 min",
          prioridade: "recomendada",
          observacao:
            "Fecha aos domingos de manhã (horário de culto). Pode ser trocada " +
            "por uma pausa se o dia apertar.",
          siteUrl: "https://bisericaneagra.ro",
          ingressoUrl: null,
          trechoAteProximo: { km: 120, min: 120, nota: null }
        },
        {
          nome: "Sighișoara",
          nomePt: "Sighișoara — cidadela",
          local: "Sighișoara",
          coords: [46.2199, 24.7925],
          modo: "driving",
          descricao:
            "Chegada ao fim da tarde. A cidadela medieval, habitada até hoje, " +
            "é Patrimônio da Humanidade. Noite tranquila: check-in e jantar " +
            "dentro das muralhas.",
          naoPerder: [
            "Entrada pela Torre do Relógio",
            "Jantar na Piața Cetății"
          ],
          tempoSugerido: "—",
          prioridade: "essencial",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null
        }
      ],
      hospedagem: {
        cidade: "Sighișoara",
        nome: "HOTEL_A_DEFINIR",
        endereco: "ENDERECO_A_DEFINIR",
        checkin: "CHECKIN_A_DEFINIR",
        telefone: "TELEFONE_A_DEFINIR",
        reservaUrl: null,
        coords: null,
        noites: 2,
        continuacao: false,
        observacao: "Duas noites em Sighișoara."
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "28set",
      foto: "sighisoara",
      data: "2026-09-28",
      dataLabel: "28 SET",
      origem: "Sighișoara",
      destino: "Sighișoara",
      titulo: "Sighișoara",
      resumo:
        "Dia inteiro dentro da cidadela, tudo a pé e num só circuito, sem " +
        "repetir caminho. A subida à Igreja da Colina é opcional — são 175 " +
        "degraus cobertos.",
      selos: [{ tom: "info", texto: "Tudo a pé" }],
      paradas: [
        {
          nome: "Piața Cetății",
          foto: "sighisoara",
          nomePt: "Praça da Cidadela",
          local: "Sighișoara",
          coords: [46.2196, 24.7920],
          modo: "walking",
          descricao:
            "O centro da cidadela, rodeado de casas coloridas dos séculos " +
            "XVI–XVIII. Ponto de partida do circuito a pé.",
          naoPerder: ["Casas coloridas da praça", "Casa do Cervo (Casa cu Cerb)"],
          tempoSugerido: "20 – 30 min",
          prioridade: "essencial",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.1, min: 2, nota: "a pé" }
        },
        {
          nome: "Turnul cu Ceas",
          foto: "sighisoara",
          nomePt: "Torre do Relógio",
          local: "Sighișoara",
          coords: [46.2199, 24.7925],
          modo: "walking",
          descricao:
            "A torre-porta de entrada da cidadela, com relógio de figuras " +
            "móveis e um pequeno museu de história. Do alto vê-se toda a " +
            "cidade — a subida é por escadas de madeira íngremes.",
          naoPerder: [
            "Figuras móveis do relógio",
            "Museu de História",
            "Terraço com vista panorâmica"
          ],
          tempoSugerido: "45 min – 1h",
          prioridade: "essencial",
          observacao: "Escadas de madeira estreitas e íngremes até o terraço.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.15, min: 3, nota: "a pé" }
        },
        {
          nome: "Casa Vlad Dracul",
          nomePt: "Casa de Vlad Dracul",
          local: "Sighișoara",
          coords: [46.2198, 24.7922],
          modo: "walking",
          descricao:
            "A casa onde teria nascido Vlad Țepeș, o príncipe que inspirou o " +
            "Drácula. A fachada e a placa já valem a parada; hoje funciona um " +
            "restaurante no local.",
          naoPerder: ["Fachada e brasão", "Placa comemorativa"],
          tempoSugerido: "10 – 15 min",
          prioridade: "opcional",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.2, min: 4, nota: "a pé" }
        },
        {
          nome: "Scara Acoperită & Biserica din Deal",
          nomePt: "Escadaria Coberta e Igreja da Colina",
          local: "Sighișoara",
          coords: [46.2210, 24.7896],
          modo: "walking",
          descricao:
            "Uma escadaria de madeira coberta de 1642, com 175 degraus, leva à " +
            "igreja gótica no ponto mais alto da cidade e ao antigo cemitério " +
            "saxão. Subida opcional e no seu ritmo.",
          naoPerder: [
            "Túnel de madeira da escadaria",
            "Interior gótico da Biserica din Deal",
            "Cemitério saxão e a vista"
          ],
          tempoSugerido: "1h – 1h30",
          prioridade: "opcional",
          observacao:
            "175 degraus em subida. Se preferir, pule esta parada — o resto " +
            "do circuito é plano.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 0.3, min: 6, nota: "a pé, descendo pela Str. Școlii" }
        },
        {
          nome: "Str. Școlii & Piața Muzeului",
          nomePt: "Ruas da cidadela",
          local: "Sighișoara",
          coords: [46.2203, 24.7912],
          modo: "walking",
          descricao:
            "A volta pelo circuito, por ruas de pedra com oficinas de artesãos " +
            "e miradouros sobre os telhados. Bom fim de tarde antes do jantar.",
          naoPerder: [
            "Rua Școlii",
            "Miradouros sobre os telhados",
            "Ateliês de artesãos"
          ],
          tempoSugerido: "30 – 45 min",
          prioridade: "recomendada",
          observacao: null,
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null
        }
      ],
      hospedagem: {
        cidade: "Sighișoara",
        nome: "HOTEL_A_DEFINIR",
        endereco: "ENDERECO_A_DEFINIR",
        checkin: "CHECKIN_A_DEFINIR",
        telefone: "TELEFONE_A_DEFINIR",
        reservaUrl: null,
        coords: null,
        noites: 2,
        continuacao: true,
        observacao: null
      }
    },

    /* ------------------------------------------------------------------ */
    {
      id: "29set",
      foto: "sibiu",
      data: "2026-09-29",
      dataLabel: "29 SET",
      origem: "Sighișoara",
      destino: "Sibiu",
      titulo: "Sighișoara → Turda → Sibiu",
      resumo:
        "Saída de Sighișoara em direção a Turda, para a Salina — uma das " +
        "visitas mais marcantes da viagem. Depois, estrada até Sibiu, com fim " +
        "de tarde leve no centro histórico.",
      selos: [
        { tom: "info", texto: "Dia de estrada" },
        { tom: "info", texto: "≈ 3 h 45 ao volante" }
      ],
      paradas: [
        {
          nome: "Salina Turda",
          nomePt: "Salina de Turda",
          local: "Turda",
          coords: [46.5875, 23.7869],
          modo: "driving",
          chegadaOrigem: { km: 150, min: 150, nota: "de Sighișoara" },
          descricao:
            "Mina de sal histórica transformada num espaço subterrâneo " +
            "espetacular, a cerca de 120 m de profundidade, com roda-gigante, " +
            "lago com barcos e ar puríssimo. Desce-se de elevador; há também " +
            "escadas para quem quiser.",
          naoPerder: [
            "Sala Rudolf e a roda-gigante",
            "Mirante sobre a mina",
            "Lago subterrâneo com barcos a remo",
            "Sala Terezia (a mais funda)"
          ],
          tempoSugerido: "1h30 – 2h",
          prioridade: "essencial",
          observacao:
            "Cerca de 12 °C o ano todo — leve casaco. Elevador disponível; o " +
            "piso é irregular em alguns trechos.",
          siteUrl: "https://salinaturda.eu",
          ingressoUrl: null,
          trechoAteProximo: { km: 15, min: 20, nota: "até o desfiladeiro" }
        },
        {
          nome: "Cheile Turzii",
          nomePt: "Desfiladeiro de Turda",
          local: "Turda",
          coords: [46.5556, 23.6836],
          modo: "driving",
          descricao:
            "Um desfiladeiro calcário estreito a poucos minutos da salina, com " +
            "paredões de até 300 m. A trilha começa plana, mas fica irregular " +
            "e com passarelas mais adiante.",
          naoPerder: ["Vista da entrada do desfiladeiro", "Primeiro trecho da trilha"],
          tempoSugerido: "45 min – 1h",
          prioridade: "opcional",
          observacao:
            "OPCIONAL. Terreno irregular e passarelas. Pule sem problema se o " +
            "dia estiver corrido ou cansativo — a viagem não perde nada.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 105, min: 100, nota: "até Sibiu" }
        },
        {
          nome: "Piața Mare",
          foto: "sibiu",
          nomePt: "Sibiu — Praça Grande",
          local: "Sibiu",
          coords: [45.7975, 24.1516],
          modo: "driving",
          descricao:
            "Antiga capital dos saxões da Transilvânia, com centro histórico " +
            "muito bem preservado e plano. Fim de tarde leve: as duas praças, " +
            "a Ponte das Mentiras e um café.",
          naoPerder: [
            "Piața Mare e Piața Mică",
            "Podul Minciunilor (Ponte das Mentiras)",
            "Os “olhos” de Sibiu nos telhados",
            "Passagem das Escadas (Pasajul Scărilor)"
          ],
          tempoSugerido: "1h – 1h30",
          prioridade: "essencial",
          observacao:
            "Ruas de pedra irregular em alguns trechos; as praças são planas.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null
        }
      ],
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
    },

    /* ------------------------------------------------------------------ */
    {
      id: "30set",
      foto: "transfagarasan",
      data: "2026-09-30",
      dataLabel: "30 SET",
      origem: "Sibiu",
      destino: "Aeroporto de Bucareste",
      titulo: "Sibiu → Transfăgărășan → Bucareste",
      resumo:
        "Último dia. Saída cedo para percorrer a Transfăgărășan de norte a " +
        "sul, com o Lago Bâlea no ponto mais alto, descer até o Lago Vidraru " +
        "e seguir para o aeroporto. O voo sai às 23:00 — o roteiro deixa " +
        "margem folgada para estrada, devolução do carro e aeroporto.",
      selos: [
        { tom: "aviso", texto: "Voo às 23:00" },
        { tom: "info", texto: "Dia de estrada" }
      ],
      avisoEstrada:
        "A Transfăgărășan é sazonal: costuma abrir por volta de julho e " +
        "fechar com a primeira neve (em geral no começo de novembro). O " +
        "trecho alto pode fechar por neblina ou gelo mesmo fora do inverno. " +
        "Confirme as condições na véspera. Se o topo estiver fechado, há um " +
        "teleférico da base norte até o Lago Bâlea.",
      avisoEstradaUrl: "https://en.wikipedia.org/wiki/Transf%C4%83g%C4%83r%C4%83%C8%99an",
      paradas: [
        {
          nome: "Cascada Bâlea",
          foto: "transfagarasan",
          nomePt: "Cascata Bâlea",
          local: "Cârțișoara",
          coords: [45.6295, 24.6205],
          modo: "driving",
          chegadaOrigem: { km: 75, min: 75, nota: "de Sibiu" },
          descricao:
            "Início da subida pela vertente norte. A cascata fica junto à " +
            "estrada, num ponto onde também há um teleférico até o Lago Bâlea " +
            "— útil se o trecho alto estiver fechado.",
          naoPerder: [
            "Cascata Bâlea",
            "Vista do vale glaciar",
            "Estação do teleférico"
          ],
          tempoSugerido: "20 – 30 min",
          prioridade: "recomendada",
          observacao: "Se o trecho alto estiver fechado, o teleférico leva ao Lago Bâlea.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 13, min: 35, nota: "curvas fechadas em subida" }
        },
        {
          nome: "Lacul Bâlea",
          foto: "transfagarasan",
          nomePt: "Lago Bâlea",
          local: "Transfăgărășan",
          coords: [45.6040, 24.6170],
          modo: "driving",
          descricao:
            "Lago glaciar a 2.034 m de altitude, no ponto mais alto da " +
            "estrada, logo antes do túnel. Vistas amplas dos dois lados da " +
            "montanha. Faz frio e venta mesmo no verão.",
          naoPerder: [
            "Lago glaciar e o anfiteatro de montanhas",
            "Mirante junto ao chalé",
            "Boca norte do túnel"
          ],
          tempoSugerido: "45 min – 1h",
          prioridade: "essencial",
          observacao:
            "≈ 2.034 m de altitude. Frio e vento; pode haver neblina. Leve " +
            "casaco. Há banheiros e cafés no local.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 35, min: 70, nota: "descida sul, muitas curvas" }
        },
        {
          nome: "Barajul Vidraru",
          foto: "transfagarasan",
          nomePt: "Barragem de Vidraru",
          local: "Arefu",
          coords: [45.3540, 24.6350],
          modo: "driving",
          descricao:
            "Na vertente sul, uma barragem de 166 m fecha um lago comprido " +
            "entre montanhas. Dá para parar sobre a barragem e nos miradouros " +
            "da descida.",
          naoPerder: [
            "Travessia sobre a barragem",
            "Miradouros da vertente sul",
            "Estátua “Electricitatea”"
          ],
          tempoSugerido: "20 – 30 min",
          prioridade: "recomendada",
          observacao:
            "A Cidadela de Poenari, nesta região, exige subir 1.480 degraus — " +
            "não recomendada para este roteiro.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: { km: 230, min: 210, nota: "até o aeroporto, via Pitești e autoestrada A1" }
        },
        {
          nome: "Aeroportul Henri Coandă (OTP)",
          nomePt: "Aeroporto de Bucareste",
          local: "Otopeni",
          coords: [44.5711, 26.0850],
          modo: "driving",
          descricao:
            "Destino final da road trip. Chegada com folga para devolver o " +
            "carro e fazer o check-in. O voo sai às 23:00.",
          naoPerder: [],
          tempoSugerido: "—",
          prioridade: "essencial",
          observacao:
            "Deixe margem de segurança: estrada + devolução do carro + filas " +
            "de check-in e segurança. Chegar ao aeroporto por volta das 20:00.",
          siteUrl: null,
          ingressoUrl: null,
          trechoAteProximo: null,
          aeroporto: true
        }
      ],
      hospedagem: null
    }
  ],

  /* -------------------------------------------------------------------- */
  carro: {
    locadora: "LOCADORA_A_DEFINIR",
    retirada: {
      local: "LOCAL_RETIRADA_A_DEFINIR",
      dataLabel: "25 SET",
      horario: "HORARIO_A_DEFINIR",
      coords: null
    },
    devolucao: {
      local: "LOCAL_DEVOLUCAO_A_DEFINIR",
      dataLabel: "30 SET",
      horario: "HORARIO_A_DEFINIR",
      coords: null
    },
    reserva: "RESERVA_CARRO_A_DEFINIR",
    telefone: "TELEFONE_A_DEFINIR",
    reservaUrl: null,
    observacao:
      "Levar carteira de habilitação, a Permissão Internacional para Dirigir " +
      "(PID) e o cartão de crédito no nome do condutor."
  },

  /* -------------------------------------------------------------------- */
  voo: {
    dataLabel: "30 SET",
    horario: "23:00",
    aeroporto: "Aeroporto Henri Coandă (OTP)",
    cidade: "Otopeni, Bucareste",
    coords: [44.5711, 26.0850],
    numeroVoo: "VOO_A_DEFINIR",
    observacao:
      "Chegar ao aeroporto por volta das 20:00, já com o carro devolvido."
  },

  /* -------------------------------------------------------------------- */
  informacoes: [
    { rotulo: "Emergências (Romênia)", valor: "112", tel: "112" },
    { rotulo: "Moeda", valor: "Leu romeno (RON) — cartão aceito na maioria dos lugares" },
    { rotulo: "Tomada", valor: "Padrão europeu (tipo F, 230 V) — levar adaptador" },
    { rotulo: "Idioma", valor: "Romeno; inglês é comum em hotéis e atrações" }
  ]
};
