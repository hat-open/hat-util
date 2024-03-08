import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


test('curry', () => {
    const fn = u.curry((x: number, y: number, z: number) => x + y + z);

    expect(fn).toBeInstanceOf(Function);
    expect(fn()()()()()()).toBeInstanceOf(Function);

    expect(fn(1)(2)(3)).toEqual(6);
    expect(fn(1, 2)(3)).toEqual(6);
    expect(fn(1)(2, 3)).toEqual(6);
    expect(fn(1, 2, 3)).toEqual(6);

    expect(fn(1)()()(2)()()(3)).toEqual(6);
});
