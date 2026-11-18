import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDisplayDate, isValidMoneyAmount } from '../validation.js';

test('rejects nonexistent calendar dates including leap-day errors', () => {
    assert.equal(parseDisplayDate('02/30/2026'), null);
    assert.equal(parseDisplayDate('02/29/2026'), null);
    assert.equal(parseDisplayDate('02/29/2024'), '2024-02-29');
    assert.equal(parseDisplayDate('11/17/2026'), '2026-11-17');
});
test('rejects fractional cents, negative values, and zero', () => {
    for (const amount of ['0.011', '2.999', '-5', '0', 'abc']) assert.equal(isValidMoneyAmount(amount), false, amount);
    for (const amount of ['0.01', '12', '12.3', '12.30']) assert.equal(isValidMoneyAmount(amount), true, amount);
});
