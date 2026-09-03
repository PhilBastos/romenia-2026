# Próximos passos

## Dados que ainda faltam (só editar `data/itinerary.js`)

- [x] Hotel de Sighișoara (27–29 set): **Casa cu Cerb**, Strada Școlii 1,
      check-in 14:00 — do itinerário Hotels.com.
- [x] Hotel de Sibiu (29–30 set): **Casa Luxemburg**, Piața Mică 16,
      check-in 16:00 — do itinerário Hotels.com.
- [ ] Hotel de Bucareste (2 noites, 25–27 set): nome, endereço, telefone,
      check-in, link da reserva, coordenadas. (Não estava no itinerário
      Hotels.com — reservar ou adicionar quando confirmado.)
- [ ] Telefone dos hotéis de Sighișoara e Sibiu (Hotels.com não mostra o
      número; pegar no e-mail de confirmação ou no site da propriedade).
- [ ] Carro: locadora, local e horário de retirada (25 set) e devolução
      (30 set), número da reserva, telefone, link.
- [ ] Voo de volta: número do voo (campo `voo.numeroVoo`).
- [ ] Conferir no Google Maps os tempos reais de cada trecho e ajustar
      `trechoAteProximo` / `chegadaOrigem` se necessário.
- [ ] Perto da viagem: confirmar se a Transfăgărășan está aberta e, se
      quiser, trocar o link de `avisoEstradaUrl` por uma fonte de status
      atualizada.
- [ ] Conferir dias de fechamento de Peleș e Bran para as datas reais.

## Ideias deixadas de fora de propósito (não são necessárias)

- **Clima / previsão do tempo** por dia — dependeria de API externa e
  chave; foge do "sem dependências". Pode ser consultado à parte.
- **Fotos das atrações** — só valeriam se forem boas e otimizadas; hoje o
  texto curto + Google Maps já orientam a decisão. Se entrarem, usar
  poucas, leves e em `assets/images/`.
- **Conversor de moeda** embutido — o cartão resolve na prática; o app não
  precisa virar utilitário.
- **Compartilhar localização entre os dois celulares** — exigiria backend;
  o casal viaja junto, no mesmo carro.
- **Modo escuro** — a estética "caderno de viagem" foi pensada clara; um
  tema escuro seria um segundo design system para pouco ganho.
- **Notas / diário de viagem** dentro do app — bonito, mas é outro produto;
  o foco aqui é orientação, não registro.

## Se o roteiro mudar bastante

A estrutura de `data/itinerary.js` aceita quantos dias e paradas quiser.
Basta manter os campos de cada parada (`nome`, `nomePt`, `local`, `coords`,
`modo`, `descricao`, `naoPerder`, `tempoSugerido`, `prioridade`) e, nos
dias de estrada, os campos de distância. A interface se ajusta sozinha.
