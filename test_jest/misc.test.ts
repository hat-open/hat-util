import { expect, test } from '@jest/globals';

import * as u from '../src_js/index';


test('identity', () => {
    expect(u.identity(42)).toEqual(42);
});


test('isNil', () => {
    expect(u.isNil(undefined)).toBe(true);
    expect(u.isNil(null)).toBe(true);
    expect(u.isNil(true)).toBe(false);
    expect(u.isNil(false)).toBe(false);
    expect(u.isNil(123)).toBe(false);
    expect(u.isNil(123.45)).toBe(false);
    expect(u.isNil('')).toBe(false);
    expect(u.isNil('abc')).toBe(false);
    expect(u.isNil([])).toBe(false);
    expect(u.isNil(['a', {}, 1])).toBe(false);
    expect(u.isNil({})).toBe(false);
    expect(u.isNil({'a': [1, []]})).toBe(false);
});


test('isBoolean', () => {
    expect(u.isBoolean(undefined)).toBe(false);
    expect(u.isBoolean(null)).toBe(false);
    expect(u.isBoolean(true)).toBe(true);
    expect(u.isBoolean(false)).toBe(true);
    expect(u.isBoolean(123)).toBe(false);
    expect(u.isBoolean(123.45)).toBe(false);
    expect(u.isBoolean('')).toBe(false);
    expect(u.isBoolean('abc')).toBe(false);
    expect(u.isBoolean([])).toBe(false);
    expect(u.isBoolean(['a', {}, 1])).toBe(false);
    expect(u.isBoolean({})).toBe(false);
    expect(u.isBoolean({'a': [1, []]})).toBe(false);
});


test('isInteger', () => {
    expect(u.isInteger(undefined)).toBe(false);
    expect(u.isInteger(null)).toBe(false);
    expect(u.isInteger(true)).toBe(false);
    expect(u.isInteger(false)).toBe(false);
    expect(u.isInteger(123)).toBe(true);
    expect(u.isInteger(123.45)).toBe(false);
    expect(u.isInteger('')).toBe(false);
    expect(u.isInteger('abc')).toBe(false);
    expect(u.isInteger([])).toBe(false);
    expect(u.isInteger(['a', {}, 1])).toBe(false);
    expect(u.isInteger({})).toBe(false);
    expect(u.isInteger({'a': [1, []]})).toBe(false);
});


test('isNumber', () => {
    expect(u.isNumber(undefined)).toBe(false);
    expect(u.isNumber(null)).toBe(false);
    expect(u.isNumber(true)).toBe(false);
    expect(u.isNumber(false)).toBe(false);
    expect(u.isNumber(123)).toBe(true);
    expect(u.isNumber(123.45)).toBe(true);
    expect(u.isNumber('')).toBe(false);
    expect(u.isNumber('abc')).toBe(false);
    expect(u.isNumber([])).toBe(false);
    expect(u.isNumber(['a', {}, 1])).toBe(false);
    expect(u.isNumber({})).toBe(false);
    expect(u.isNumber({'a': [1, []]})).toBe(false);
});


test('isString', () => {
    expect(u.isString(undefined)).toBe(false);
    expect(u.isString(null)).toBe(false);
    expect(u.isString(true)).toBe(false);
    expect(u.isString(false)).toBe(false);
    expect(u.isString(123)).toBe(false);
    expect(u.isString(123.45)).toBe(false);
    expect(u.isString('')).toBe(true);
    expect(u.isString('abc')).toBe(true);
    expect(u.isString([])).toBe(false);
    expect(u.isString(['a', {}, 1])).toBe(false);
    expect(u.isString({})).toBe(false);
    expect(u.isString({'a': [1, []]})).toBe(false);
});


test('isArray', () => {
    expect(u.isArray(undefined)).toBe(false);
    expect(u.isArray(null)).toBe(false);
    expect(u.isArray(true)).toBe(false);
    expect(u.isArray(false)).toBe(false);
    expect(u.isArray(123)).toBe(false);
    expect(u.isArray(123.45)).toBe(false);
    expect(u.isArray('')).toBe(false);
    expect(u.isArray('abc')).toBe(false);
    expect(u.isArray([])).toBe(true);
    expect(u.isArray(['a', {}, 1])).toBe(true);
    expect(u.isArray({})).toBe(false);
    expect(u.isArray({'a': [1, []]})).toBe(false);
});


test('isObject', () => {
    expect(u.isObject(undefined)).toBe(false);
    expect(u.isObject(null)).toBe(false);
    expect(u.isObject(true)).toBe(false);
    expect(u.isObject(false)).toBe(false);
    expect(u.isObject(123)).toBe(false);
    expect(u.isObject(123.45)).toBe(false);
    expect(u.isObject('')).toBe(false);
    expect(u.isObject('abc')).toBe(false);
    expect(u.isObject([])).toBe(false);
    expect(u.isObject(['a', {}, 1])).toBe(false);
    expect(u.isObject({})).toBe(true);
    expect(u.isObject({'a': [1, []]})).toBe(true);
});


test('strictParseInt', () => {
    expect(u.strictParseInt('123')).toEqual(123);
    expect(u.strictParseInt('0')).toEqual(0);
    expect(u.strictParseInt('-321')).toEqual(-321);

    expect(u.strictParseInt('')).toBeNaN();
    expect(u.strictParseInt('123.45')).toBeNaN();
    expect(u.strictParseInt('abc')).toBeNaN();
    expect(u.strictParseInt('-321.00')).toBeNaN();
});


test('strictParseFloat', () => {
    expect(u.strictParseFloat('123')).toEqual(123);
    expect(u.strictParseFloat('0')).toEqual(0);
    expect(u.strictParseFloat('-321')).toEqual(-321);
    expect(u.strictParseFloat('123.45')).toEqual(123.45);
    expect(u.strictParseFloat('-321.00')).toEqual(-321);

    expect(u.strictParseFloat('')).toBeNaN();
    expect(u.strictParseFloat('abc')).toBeNaN();
});


test('clone', () => {
    expect(u.clone(null)).toEqual(null);
    expect(u.clone(true)).toEqual(true);
    expect(u.clone(123)).toEqual(123);
    expect(u.clone('abc')).toEqual('abc');
    expect(u.clone([1, [2], 3])).toEqual([1, [2], 3]);
    expect(u.clone({a: 1, b: {}})).toEqual({a: 1, b: {}});
});


test('clone array', () => {
    const x1 = [1, [2], 3];
    const x2 = u.clone(x1);
    expect(x2).toEqual(x1);

    (x2[1] as number[]).push(42);
    expect(x1).toEqual([1, [2], 3]);
    expect(x2).toEqual([1, [2, 42], 3]);
});


test('clone object', () => {
    const x1 = {a: {b: {c: ({} as any)}, d: 123}};
    const x2 = u.clone(x1);
    expect(x2).toEqual(x1);

    x2.a.b.c['abc'] = 42;
    expect(x1).toEqual({a: {b: {c: {}}, d: 123}});
    expect(x2).toEqual({a: {b: {c: {abc: 42}}, d: 123}});
});


test('zip', () => {
    expect(u.zip([], [])).toEqual([]);
    expect(u.zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
    expect(u.zip([1], ['a', 'b', 'c'])).toEqual([[1, 'a']]);
    expect(u.zip([1, 2, 3], ['a'])).toEqual([[1, 'a']]);
});


test('toPairs', () => {
    expect(u.toPairs({})).toEqual([]);
    expect(u.toPairs({a: 1, b: 2})).toEqual([['a', 1], ['b', 2]]);
    expect(u.toPairs({a: {}})).toEqual([['a', {}]]);
});


test('fromPairs', () => {
    expect(u.fromPairs([])).toEqual({});
    expect(u.fromPairs([['a', 1], ['b', 2]])).toEqual({a: 1, b: 2});
    expect(u.fromPairs([['a', {}]])).toEqual({a: {}});
});


test('flatten', () => {
    expect(u.flatten([])).toEqual([]);
    expect(u.flatten([[], [[[]]], []])).toEqual([]);
    expect(u.flatten([[], [[1, []]], 2, [[], [], [3]]])).toEqual([1, 2, 3]);
    expect(u.flatten([{a: [[], []]}])).toEqual([{a: [[], []]}]);
    expect(u.flatten(42)).toEqual([42]);
});


test('flap', () => {
    expect(u.flap()()).toEqual([]);
    expect(u.flap(u.dec, u.identity, u.inc)(123)).toEqual([122, 123, 124]);
});


test('equals', () => {
    expect(u.equals(undefined, undefined)).toBe(true);
    expect(u.equals(null, null)).toBe(true);
    expect(u.equals(true, true)).toBe(true);
    expect(u.equals(false, false)).toBe(true);
    expect(u.equals(123, 123.00)).toBe(true);
    expect(u.equals('', '')).toBe(true);
    expect(u.equals([], [])).toBe(true);
    expect(u.equals({}, {})).toBe(true);

    expect(u.equals(undefined, null)).toBe(false);
    expect(u.equals(true, false)).toBe(false);
    expect(u.equals(0, false)).toBe(false);
    expect(u.equals('', null)).toBe(false);
    expect(u.equals(0, '0')).toBe(false);
    expect(u.equals([], {})).toBe(false);
    expect(u.equals([1], [])).toBe(false);
    expect(u.equals([1], [2])).toBe(false);
    expect(u.equals({a: {}}, {})).toBe(false);
    expect(u.equals({a: {}}, {b: {}})).toBe(false);
    expect(u.equals({a: 1}, {a: 2})).toBe(false);
    expect(u.equals(123, 123.45)).toBe(false);

    expect(u.equals([1, 2, {a: [], b: 123}], [1, 2, {a: [], b: 123}])).toBe(true);
});


test('repeat', () => {
    expect(u.repeat(42, 0)).toEqual([]);
    expect(u.repeat(42, 1)).toEqual([42]);
    expect(u.repeat(42, 3)).toEqual([42, 42, 42]);
});


test('sort', () => {
    const fn = (x: number, y: number) => x - y;
    expect(u.sort(fn, [])).toEqual([]);
    expect(u.sort(fn, [3, 1, 4, 2])).toEqual([1, 2, 3, 4]);
});


test('sortBy', () => {
    expect(u.sortBy(u.identity, [])).toEqual([]);
    expect(u.sortBy(u.identity, [3, 1, 4, 2])).toEqual([1, 2, 3, 4]);
    expect(u.sortBy(u.identity, [1, 2, 1, 2])).toEqual([1, 1, 2, 2]);
});


test('pick', () => {
    expect(u.pick([], {})).toEqual({});
    expect(u.pick(['a', 'c'], {a: 1, b: 2})).toEqual({a: 1});
});


test.todo('map');


test.todo('filter');


test.todo('append');


test.todo('reduce');


test.todo('merge');


test.todo('mergeAll');


test.todo('find');


test.todo('findIndex');


test.todo('concat');


test.todo('union');


test.todo('contains');


test.todo('insert');


test.todo('slice');


test.todo('reverse');


test.todo('length');


test.todo('inc');


test.todo('dec');


test.todo('not');
