import { expect, test } from '@jest/globals';

import * as u from '../src_js/index.js';


test("sleep", async () => {
    const result: string[] = [];

    async function addResult(t: number, msg: string) {
        await u.sleep(t);
        result.push(msg);
    }

    await Promise.all([
        addResult(20, 'a1'),
        addResult(10, 'a2'),
        addResult(40, 'a3'),
        addResult(30, 'a4')
    ]);

    expect(result).toEqual(['a2', 'a1', 'a4', 'a3']);
});


test("delay", async () => {
    const result: string[] = [];

    function addResult(msg: string) {
        result.push(msg);
    }

    await Promise.all([
        u.delay(addResult, 20, 'a1'),
        u.delay(addResult, 10, 'a2'),
        u.delay(addResult, 40, 'a3'),
        u.delay(addResult, 30, 'a4')
    ]);

    expect(result).toEqual(['a2', 'a1', 'a4', 'a3']);
});


test("future setResult", async () => {
    const f = u.createFuture();
    expect(f.done()).toBe(false);
    expect(f.result).toThrow();

    f.setResult(123);
    expect(f.done()).toBe(true);
    expect(f.result()).toEqual(123);

    expect(() => {
        f.setResult(321);
    }).toThrow();
});


test("future await", async () => {
    const f = u.createFuture();
    u.delay(f.setResult, 1, 42);

    expect(f.done()).toBe(false);
    const result = await f;
    expect(result).toEqual(42);
});


test("future setError", async () => {
    const f = u.createFuture();
    u.delay(f.setError, 1, '42');

    expect(f.done()).toBe(false);
    let result;
    try {
        await f;
    } catch (e) {
        result = e;
    }
    expect(result).toEqual('42');
    expect(f.result).toThrow('42');

    expect(() => {
        f.setError('24');
    }).toThrow();
});
