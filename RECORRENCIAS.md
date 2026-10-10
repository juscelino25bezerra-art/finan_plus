# Recorrências nos próximos meses ("Previsto")

Desde a versão 1.4.1 do Android (1.3.1 da web, 1.2.1 do Linux).

## O problema

Uma recorrência (por exemplo, "Adiantamento Quinzenal", receita de R$ 1.213,62 todo dia 15) só vira lançamento quando o mês chega. Em outubro, o calendário de novembro e dezembro ficava sem ela, enquanto as compras parceladas, que criam todas as parcelas de uma vez, apareciam. Parecia que "só as despesas fixavam".

## Como funciona agora

Nos **meses que ainda não chegaram**, cada recorrência ativa aparece como **Previsto**:

- **Calendário:** o dia mostra o valor e o pontinho, como os outros lançamentos. Na lista do dia: "Adiantamento Quinzenal · Previsto · recorrência", com o ícone de repetir no lugar do círculo de pago.
- **Lista:** quando o período vai até um mês futuro, os previstos aparecem nos grupos por dia e contam em "a receber" / "a pagar" e no saldo "previsto". Os filtros valem para eles também (são pendentes).
- **Saldo previsto ao fim do dia** (calendário) e as pendências do mês contam os previstos.
- **Tocar num previsto** abre a recorrência. Mudar o valor, o dia ou a categoria muda todos os meses futuros na hora; pausar ou excluir faz os previstos sumirem.

**Nada é gravado.** Quando o mês chega, o app cria o lançamento real (pendente), como sempre, e o previsto daquele mês dá lugar a ele. Aí dá para marcar como recebido/pago, editar só aquele mês ou excluir.

## O que não muda

- **Mês atual:** sem previstos; a recorrência já foi gerada de verdade. O "Saldo previsto" do Início (fim do mês atual) é o mesmo de antes.
- **Relatórios, PDF, assistente, backup e CSV:** só lançamentos que existem (e, nos relatórios, realizados).
- **Recorrência no cartão:** aparece prevista no dia, mas, como qualquer compra no cartão, só conta pela fatura (a fatura do mês futuro não é prevista).
- Período "Todo o período" ou sem data final: sem previstos (não há fim para projetar).

## Regra

`Projection.between(estado, de, até, hoje)` (Android `core/Projection.kt`, web `Projection` em `js/core.js`, Linux `projection_between` em `src/core/period.c`), para cada recorrência ativa:

- meses a partir do **mês seguinte ao atual** e depois do último mês já gerado;
- nunca antes da data de início;
- dia limitado ao último dia do mês (31 vira 30, ou 28/29 em fevereiro);
- id `prev:<recorrência>:<AAAA-MM>`, pendente; nunca entra no estado salvo.

Testes: `ProjectionTest.kt` (Android), `tests/projection.test.mjs` (web), `tests/test_period.c` (Linux), com os mesmos casos.
