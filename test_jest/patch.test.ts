import { expect, test } from '@jest/globals';

import * as u from '../src_js/index';


const data: u.JData = {
    a: [1, 2, [[], 123], {b: 'abc'}],
    c: true
};


test('empty', () => {
    expect(u.patch([], data)).toEqual(data);
});


test.todo('add');


test.todo('remove');


test.todo('replace');


test.todo('move');


test.todo('copy');


test.todo('test');
