import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


test('pipe', () => {
    expect(u.pipe()(123)).toEqual(123);

    expect(u.pipe(u.inc)(123)).toEqual(124);
    expect(u.pipe(u.inc, u.dec)(123)).toEqual(123);

    expect(u.pipe((x, y, z) => x + y + z)(1, 2, 3)).toEqual(6);
});
