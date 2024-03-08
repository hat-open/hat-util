import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


const vt: u.VNode = ['div',
    ['div', 'a1'],
    'a2',
    [],
    ['div', {xyz: 123}, 'a3'],
    [[]]
];


test("isVNodeWithoutData", () => {
    expect(u.isVNodeWithoutData(vt)).toBe(true);
    expect(u.isVNodeWithoutData(vt[1] as u.VNode)).toBe(true);
    expect(u.isVNodeWithoutData(vt[4] as u.VNode)).toBe(false);
});


test("isVNodeWithData", () => {
    expect(u.isVNodeWithData(vt)).toBe(false);
    expect(u.isVNodeWithData(vt[1] as u.VNode)).toBe(false);
    expect(u.isVNodeWithData(vt[4] as u.VNode)).toBe(true);
});


test("isVNode", () => {
    expect(u.isVNode(vt)).toBe(true);
    expect(u.isVNode(vt[1] as u.VNodeChild)).toBe(true);
    expect(u.isVNode(vt[2] as u.VNodeChild)).toBe(false);
    expect(u.isVNode(vt[3] as u.VNodeChild)).toBe(false);
    expect(u.isVNode(vt[4] as u.VNodeChild)).toBe(true);
    expect(u.isVNode(vt[5] as u.VNodeChild)).toBe(false);
});


test("getVNodeChildren", () => {
    expect(u.getVNodeChildren(vt)).toEqual(vt.slice(1));
    expect(u.getVNodeChildren(vt[1] as u.VNode)).toEqual(['a1']);
    expect(u.getVNodeChildren(vt[4] as u.VNode)).toEqual(['a3']);
});


test("getFlatVNodeChildren", () => {
    expect(u.getFlatVNodeChildren(vt)).toEqual([vt[1], vt[2], vt[4]]);
});


test("flattenVNodeChildren", () => {
    const childern = u.pipe(
        u.getVNodeChildren,
        u.flattenVNodeChildren,
        Array.from<string | u.VNode>
    )(vt);
    expect(childern).toEqual([vt[1], vt[2], vt[4]]);
});


test('changeVNodeData', () => {
    const fn = (x: u.VNodeData | null) => ({xyz: (x ? x.xyz + 1 : 42)});

    expect(u.changeVNodeData(fn, vt[1] as u.VNode)).toEqual(
        ['div', {xyz: 42}, 'a1']
    );
    expect(u.changeVNodeData(fn, vt[4] as u.VNode)).toEqual(
        ['div', {xyz: 124}, 'a3']
    );
});


test.todo('changeVNodeChildren');


test.todo('queryVNodePath');


test.todo('queryAllVNodePaths');


test.todo('getVNode');


test.todo('changeVNode');


test.todo('setVNode');


test.todo('omitVNode');
