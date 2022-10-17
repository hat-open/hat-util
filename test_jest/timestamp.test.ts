import { expect, test } from '@jest/globals';

import * as u from '../src_js/index';


test('timestampToLocalString', () => {
    const date = new Date(2000, 0, 1, 2, 3, 4, 5);
    const t = date.getTime() / 1000;
    expect(u.timestampToLocalString(t)).toEqual('2000-01-01 02:03:04.005');
});
