// Finan+ — Copyright (C) 2026 Juscelino Be
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Recorrências previstas nos meses que ainda não chegaram: os mesmos casos do app Android (ProjectionTest.kt).
import test from 'node:test';
import assert from 'node:assert/strict';
import { tx, newState, Finance, Ops, Projection, isProjected } from '../js/core.js';
import { MonthCalendar, Period } from '../js/calendar.js';

const ym = (y, m) => y * 12 + m - 1;
const TODAY = '2026-10-10';
const rec = (id, kind, value, day, start, last, o = {}) => ({ id, kind, desc: id, value, category: 'Salário', accountId: 'main', cardId: o.card ?? '', day, active: o.active ?? true, start, last });
const adiant = rec('adiant', 'income', 121362, 15, '2026-10-15', ym(2026, 10));

test('previstas: só os próximos meses, nunca o atual', () => {
  const l = Projection.between(newState({ recurring: [adiant] }), '2026-10-01', '2026-12-31', TODAY);
  assert.deepEqual(l.map(t => t.date), ['2026-11-15', '2026-12-15']);
  assert.ok(l.every(t => isProjected(t) && !t.paid && t.kind === 'income' && t.value === 121362 && t.recurringId === 'adiant'));
  assert.equal(l[0].id, 'prev:adiant:2026-11');
  assert.equal(Ops.canTogglePaid(l[0]), false);
});

test('previstas: pausada, início futuro, meses curtos e last atrasado', () => {
  assert.deepEqual(Projection.between(newState({ recurring: [{ ...adiant, active: false }] }), TODAY, '2027-12-31', TODAY), []);
  const later = rec('r', 'expense', 5000, 31, '2027-02-10', null);
  assert.deepEqual(Projection.between(newState({ recurring: [later] }), TODAY, '2027-04-30', TODAY).map(t => t.date), ['2027-02-28', '2027-03-31', '2027-04-30']);
  const stale = rec('s', 'income', 1000, 5, null, ym(2026, 8));
  assert.deepEqual(Projection.between(newState({ recurring: [stale] }), TODAY, '2026-11-30', TODAY).map(t => t.date), ['2026-11-05']);
});

test('previstas: calendário, pendências e saldo previsto', () => {
  const s = newState({ recurring: [adiant], txs: [tx({ id: 'alug', kind: 'expense', value: 12140, date: '2026-11-30', desc: 'Parcela', category: 'Outros', paid: false })] });
  const nov = ym(2026, 11);
  const day = MonthCalendar.build(s, nov, TODAY).get('2026-11-15');
  assert.equal(day.income, 121362);
  assert.deepEqual([...day.marks], ['income']);
  assert.deepEqual(Period.monthPending(s, nov, TODAY), { toReceive: 121362, toPay: 12140 });
  assert.equal(Finance.futureBalance(s, '2026-11-30', TODAY) - Finance.currentBalance(s), 121362 - 12140);
  assert.equal(Finance.futureBalance(newState({ recurring: [adiant] }), '2026-10-31', TODAY), Finance.futureBalance(newState(), '2026-10-31', TODAY));
});

test('previstas: quando o mês chega, o lançamento real ocupa o lugar', () => {
  const NOV1 = '2026-11-01';
  const [s, n] = Finance.generateRecurring(newState({ recurring: [adiant] }), NOV1);
  assert.equal(n, 1);
  assert.equal(s.txs[0].date, '2026-11-15');
  assert.deepEqual(Projection.between(s, NOV1, '2026-12-31', NOV1).map(t => t.date), ['2026-12-15']);
  assert.equal(MonthCalendar.build(s, ym(2026, 11), NOV1).get('2026-11-15').income, 121362);
});
