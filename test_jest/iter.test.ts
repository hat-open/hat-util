import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


test('islice', () => {
    expect(Array.from(u.islice(0, null, []))).toEqual([]);
    expect(Array.from(u.islice(0, null, [1, 2, 3]))).toEqual([1, 2, 3]);
    expect(Array.from(u.islice(0, 3, [1, 2, 3]))).toEqual([1, 2, 3]);

    expect(Array.from(u.islice(1, 2, [1, 2, 3]))).toEqual([2]);
    expect(Array.from(u.islice(1, -1, [1, 2, 3]))).toEqual([2]);
    expect(Array.from(u.islice(-2, -1, [1, 2, 3]))).toEqual([2]);

    expect(Array.from(u.islice(1, 1, [1, 2, 3]))).toEqual([]);
    expect(Array.from(u.islice(2, 1, [1, 2, 3]))).toEqual([]);

    expect(Array.from(u.islice(-50, 50, [1, 2, 3]))).toEqual([1, 2, 3]);
});
