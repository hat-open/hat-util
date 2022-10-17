import { expect, test } from '@jest/globals';

import * as u from '../src_js/index';


test('get', () => {
    expect(u.get).toBeInstanceOf(Function);

    const data: u.JData = {
        a: [1, 2, [[], 123], {b: 'abc'}],
        c: true
    };

    expect(u.get([], data)).toEqual(data);
    expect(u.get('c', data)).toEqual(true);
    expect(u.get(['a', 2, 0], data)).toEqual([]);
    expect(u.get(['a', 2, 1], data)).toEqual(123);
    expect(u.get(['a', 3, 'b'], data)).toEqual('abc');
    expect(u.get([['a', [[]], 3, ['b']]], data)).toEqual('abc');
});


test('change', () => {
    expect(u.change).toBeInstanceOf(Function);
});
