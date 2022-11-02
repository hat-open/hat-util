import { expect, test } from '@jest/globals';

import * as u from '../src_js/index';


const data: u.JData = {
    a: [1, 2, [[], 123], {b: 'abc'}],
    c: true
};


test('empty', () => {
    expect(u.patch([], data)).toEqual(data);
});


test('add', () => {
    expect(u.patch([{
        op: 'add',
        path: '',
        value: 42
    }], data)).toEqual(42);

    expect(u.patch([{
        op: 'add',
        path: '/a/3/b',
        value: 'cba'
    }], data)).toEqual(u.set(['a', 3, 'b'], 'cba', data));

    expect(u.patch([{
        op: 'add',
        path: '/a/2/0/-',
        value: 42
    }], data)).toEqual(u.set(['a', 2, 0, 0], 42, data));

    expect(u.patch([{
        op: 'add',
        path: '/a/2/0/0',
        value: 42
    }], data)).toEqual(u.set(['a', 2, 0, 0], 42, data));

    expect(u.patch([{
        op: 'add',
        path: '/a/2/0',
        value: 321
    }], data)).toEqual(u.set(['a', 2], [321, [], 123], data));
});


test('remove', () => {
    expect(u.patch([{
        op: 'remove',
        path: ''
    }], data)).toEqual(null);

    expect(u.patch([{
        op: 'remove',
        path: '/a/3/b'
    }], data)).toEqual(u.omit(['a', 3, 'b'], data));

    expect(u.patch([{
        op: 'remove',
        path: '/a/2/0'
    }], data)).toEqual(u.omit(['a', 2, 0], data));
});


test('replace', () => {
    expect(u.patch([{
        op: 'replace',
        path: '',
        value: 42
    }], data)).toEqual(42);

    expect(u.patch([{
        op: 'replace',
        path: '/a/3/b',
        value: 'cba'
    }], data)).toEqual(u.set(['a', 3, 'b'], 'cba', data));

    expect(u.patch([{
        op: 'replace',
        path: '/a/2/0',
        value: 321
    }], data)).toEqual(u.set(['a', 2, 0], 321, data));
});


test('move', () => {
    expect(u.patch([{
        op: 'move',
        from: '',
        path: ''
    }], data)).toEqual(data);

    expect(u.patch([{
        op: 'move',
        from: '/c',
        path: '/a'
    }], data)).toEqual({a: true});
});


test('copy', () => {
    expect(u.patch([{
        op: 'copy',
        from: '',
        path: ''
    }], data)).toEqual(data);

    expect(u.patch([{
        op: 'copy',
        from: '/c',
        path: '/a'
    }], data)).toEqual({a: true, c: true});
});


test('test', () => {
    u.patch([{
        op: 'test',
        path: '',
        value: data
    }], data);

    u.patch([{
        op: 'test',
        path: '/a/3',
        value: {b: 'abc'}
    }], data);
});
