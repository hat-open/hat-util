import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


const data: u.JData = {
    a: [1, 2, [[], 123], {b: 'abc'}],
    c: true
};

test('get', () => {
    expect(u.get).toBeInstanceOf(Function);
    expect(u.get()).toBeInstanceOf(Function);
    expect(u.get(123)).toBeInstanceOf(Function);

    expect(u.get([], data)).toEqual(data);
    expect(u.get('c', data)).toEqual(true);
    expect(u.get(['a', 2, 0], data)).toEqual([]);
    expect(u.get(['a', 2, 1], data)).toEqual(123);
    expect(u.get(['a', 3, 'b'], data)).toEqual('abc');

    expect(u.get([['a', [[]], 3, ['b']]], data)).toEqual('abc');

    expect(u.get(0, data)).toEqual(null);
    expect(u.get('b', data)).toEqual(null);
    expect(u.get([1, 'a', 2], data)).toEqual(null);
});


test('change', () => {
    expect(u.change).toBeInstanceOf(Function);
    expect(u.change()).toBeInstanceOf(Function);
    expect(u.change(123)).toBeInstanceOf(Function);
    expect(u.change(123, u.identity)).toBeInstanceOf(Function);

    expect(u.change('c', u.not, data)).toEqual({...data, c: false});
});


test('set', () => {
    expect(u.set).toBeInstanceOf(Function);
    expect(u.set()).toBeInstanceOf(Function);
    expect(u.set(123)).toBeInstanceOf(Function);
    expect(u.set(123, 321)).toBeInstanceOf(Function);

    expect(u.set('a', false, data)).toEqual({a: false, c: true});

    expect(u.set(1, 42, null)).toEqual([null, 42]);

    expect(u.set(['a', 'b', 'c'], 123, data)).toEqual({a: {b: {c: 123}}, c: true});
});


test('omit', () => {
    expect(u.omit).toBeInstanceOf(Function);
    expect(u.omit()).toBeInstanceOf(Function);
    expect(u.omit(123)).toBeInstanceOf(Function);

    expect(u.omit('a', data)).toEqual({c: true});

    expect(u.omit(['a', 2], data)).toEqual({a: [1, 2, {b: 'abc'}], c: true});
    expect(u.omit(['a', 2, 0], data)).toEqual({a: [1, 2, [123], {b: 'abc'}], c: true});

    expect(u.omit([], data)).toEqual(null);

    expect(u.omit('b', data)).toEqual(data);
    expect(u.omit(0, data)).toEqual(data);
    expect(u.omit(['a', 'b'], data)).toEqual(data);
});


test('move', () => {
    expect(u.move).toBeInstanceOf(Function);
    expect(u.move()).toBeInstanceOf(Function);
    expect(u.move(123)).toBeInstanceOf(Function);
    expect(u.move(123, 321)).toBeInstanceOf(Function);

    expect(u.move('c', 'a', data)).toEqual({a: true});
    expect(u.move('b', 'a', data)).toEqual({a: null, c: true});
    expect(u.move(0, 'a', data)).toEqual({a: null, c: true});
});
