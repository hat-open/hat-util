import { curry } from './curry';


/**
 * Identity function returning same value provided as argument.
 */
export function identity<T>(x: T): T {
    return x;
}

/**
 * Check if value is `null` or `undefined`.
 *
 * For same argument, if this function returns `true`, functions `isBoolean`,
 * `isInteger`, `isNumber`, `isString`, `isArray` and `isObject` will return
 * `false`.
 */
export function isNil(x: unknown): x is (null | undefined) {
    return x == null;
}

/**
 * Check if value is Boolean.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isInteger`, `isNumber`, `isString`, `isArray` and `isObject` will return
 * `false`.
 */
export function isBoolean(x: unknown): x is boolean {
    return typeof(x) == 'boolean';
}

/**
 * Check if value is Integer.
 *
 * For same argument, if this function returns `true`, function `isNumber` will
 * also return `true`.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isBoolean`, `isString`, `isArray` and `isObject` will return `false`.
 */
export function isInteger(x: unknown): x is number {
    return Number.isInteger(x);
}

/**
 * Check if value is Number.
 *
 * For same argument, if this function returns `true`, function `isInteger` may
 * also return `true` if argument is integer number.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isBoolean`, `isString`, `isArray` and `isObject` will return `false`.
 */
export function isNumber(x: unknown): x is number {
    return typeof(x) == 'number';
}

/**
 * Check if value is String.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isBoolean`, `isInteger`, `isNumber`, `isArray`, and `isObject` will return
 * `false`.
 */
export function isString(x: unknown): x is string {
    return typeof(x) == 'string';
}

/**
 * Check if value is Array.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isBoolean`, `isInteger`, `isNumber`, `isString`, and `isObject` will return
 * `false`.
 */
export function isArray(x: unknown): x is unknown[] {
    return Array.isArray(x);
}

/**
 * Check if value is Object.
 *
 * For same argument, if this function returns `true`, functions `isNil`,
 * `isBoolean`, `isInteger`, `isNumber`, `isString`, and `isArray` will return
 * `false`.
 */
export function isObject(x: unknown): x is {[key: string]: unknown} {
    return typeof(x) == 'object' && !isArray(x) && !isNil(x);
}

/**
 * Strictly parse integer from string
 *
 * If provided string doesn't represent integer value, `NaN` is returned.
 */
export function strictParseInt(value: string): number {
    if (/^(-|\+)?([0-9]+)$/.test(value))
        return Number(value);
    return NaN;
}

/**
 * Strictly parse floating point number from string
 *
 * If provided string doesn't represent valid number, `NaN` is returned.
 */
export function strictParseFloat(value: string): number {
    if (/^(-|\+)?([0-9]+(\.[0-9]+)?)$/.test(value))
        return Number(value);
    return NaN;
}

/**
 * Create new deep copy of input value.
 *
 * In case of Objects or Arrays, new instances are created with elements
 * obtained by recursivly calling `clone` in input argument values.
 */
export function clone<T>(x: T): T {
    if (isArray(x))
        return Array.from(x, clone) as T;
    if (isObject(x)) {
        const ret: {[key: string]: any} = {};
        for (let i in x)
            ret[i] = clone(x[i]);
        return ret as T;
    }
    return x;
}

/**
 * Combine two arrays in single array of pairs
 *
 * The returned array is truncated to the length of the shorter of the two
 * input arrays.
 */
export function zip<T1, T2>(
    arr1: T1[],
    arr2: T2[]
): [T1, T2][] {
    return Array.from((function*() {
        for (let i = 0; i < arr1.length || i < arr2.length; ++i)
            yield [arr1[i], arr2[i]];
    })());
}

/**
 * Convert object to array of key, value pairs
 */
export function toPairs<T>(
    obj: {[key: string]: T}
): [string, T][] {
    return Object.entries(obj);
}

/**
 * Convert array of key, value pairs to object
 */
export function fromPairs<T>(
    arr: [string, T][]
): {[key: string]: T} {
    const ret: {[key: string]: T} = {};
    for (const [k, v] of arr)
        ret[k] = v;
    return ret;
}

/**
 * Flatten nested arrays.
 *
 * Create array with same elements as in input array where all elements which
 * are also arrays are replaced with elements of resulting recursive
 * application of flatten function.
 *
 * If argument is not an array, function returns the argument encapsulated in
 * an array.
 */
export function flatten(arr: any): any[] {
    return isArray(arr) ? arr.flat(Infinity) : [arr];
}

/**
 * Create function which applies list of functions to same arguments and
 * return list of results.
 */
export function flap<T extends [...any]>(
    ...fns: ((...args: T) => any)[]
): ((...args: T) => any[]) {
    // @ts-ignore
    return (...args) => fns.map(fn => fn.apply(this, args));
}

/**
 * Deep object equality
 */
export const equals = curry((
    x: any,
    y: any
): boolean => {
    if (x === y)
        return true;
    if (typeof(x) != 'object' ||
        typeof(y) != 'object' ||
        x === null ||
        y === null)
        return false;
    if (Array.isArray(x) && Array.isArray(y)) {
        if (x.length != y.length)
            return false;
        for (const [a, b] of zip(x, y)) {
            if (!equals(a, b))
                return false;
        }
        return true;
    } else if (!Array.isArray(x) && !Array.isArray(y)) {
        if (Object.keys(x).length != Object.keys(y).length)
            return false;
        for (const key in x) {
            if (!(key in y))
                return false;
        }
        for (const key in x) {
            if (!equals(x[key], y[key]))
                return false;
        }
        return true;
    }
    return false;
});

/**
 * Create array by repeating same value
 */
export const repeat = curry(<T>(
    x: T,
    n: number
): T[] => Array.from({length: n}, _ => x));


/**
 * Sort array
 *
 * Comparison function receives two arguments representing array elements and
 * should return:
 *   - negative number in case first argument is more significant then second
 *   - zero in case first argument is equaly significant as second
 *   - positive number in case first argument is less significant then second
 */
export const sort = curry(<T>(
    fn: ((x: T, y: T) => number),
    arr: T[]
): T[] => Array.from(arr).sort(fn));

/**
 * Sort array based on results of appling function to it's elements
 * (curried function)
 *
 * Resulting order is determined by comparring function application results
 * with greater then and lesser then operators.
 */
export const sortBy = curry(<T>(
    fn: ((x: T) => any),
    arr: T[]
): T[] => sort((x: T, y: T) => {
    const xVal = fn(x);
    const yVal = fn(y);
    if (xVal < yVal)
        return -1;
    if (xVal > yVal)
        return 1;
    return 0;
}, arr));

/**
 * Create object containing only subset of selected properties
 */
export const pick = curry((
    arr: string[],
    obj: {[key: string]: any}
): {[key: string]: any} => {
    const ret: typeof obj = {};
    for (const i of arr)
        if (i in obj)
            ret[i] = obj[i];
    return ret;
});

/**
 * Change array or object by appling function to it's elements
 *
 * For each element, provided function is called with element value,
 * index/key and original container.
 */
export const map = curry((() => {
    function _map<T1, T2>(
        fn: ((val: T1, index?: number, arr?: T1[]) => T2),
        arr: T1[]
    ): T2[];
    function _map<T1, T2>(
        fn: ((val: T1, key?: string, obj?: {[key: string]: T1}) => T2),
        obj: {[key: string]: T1}
    ): {[key: string]: T2};
    function _map(fn: any, x: any) {
        if (isArray(x))
            return x.map(fn);
        const res: typeof x = {};
        for (const k in x)
            res[k] = fn(x[k], k, x);
        return res;
    }
    return _map;
})());

/**
 * Change array to contain only elements for which function returns `true`
 */
export const filter = curry(<T>(
    fn: ((val: T) => boolean),
    arr: T[]
): T[] => arr.filter(fn));

/**
 * Append value to end of array
 */
export const append = curry(<T>(
    val: T,
    arr: T[]
): T[] => arr.concat([val]));

/**
 * Reduce array or object by appling function
 *
 * For each element, provided function is called with accumulator,
 * elements value, element index/key and original container.
 */
export const reduce = curry((() => {
    function _reduce<T1, T2>(
        fn: ((acc: T2, val: T1, index?: number, arr?: T1[]) => T2),
        val: T2,
        arr: T1[]
    ): T2;
    function _reduce<T1, T2>(
        fn: ((acc: T2, val: T1, key?: string, obj?: {[key: string]: T1}) => T2),
        val: T2,
        obj: {[key: string]: T1}
    ): T2;
    function _reduce(fn: any, val: any, x: any) {
        if (isArray(x))
            return x.reduce(fn, val);
        let acc = val;
        for (const k in x)
            acc = fn(acc, x[k], k, x);
        return acc;
    }
    return _reduce;
})());

/**
 * Merge two objects
 *
 * If same property exist in both arguments, second argument's value is used
 * as resulting value
 */
export const merge = curry(<T extends {[key: string]: any}>(
    x: T,
    y: T
): T => Object.assign({}, x, y));

/**
 * Merge multiple objects
 *
 * If same property exist in multiple arguments, value from the last argument
 * containing that property is used
 */
export const mergeAll = reduce(merge, {} as {[key: string]: any});

/**
 * Find element in array or object for which provided function returns `true`
 * (curried function)
 *
 * Until element is found, provided function is called for each element with
 * arguments: current element, current index/key and initial container.
 *
 * If searched element is not found, `undefined` is returned.
 */
export const find = curry((() => {
    function _find<T>(
        fn: ((val: T, index?: number, arr?: T) => boolean),
        arr: T[]
    ): T | undefined;
    function _find<T>(
        fn: ((val: T, key?: string, obj?: {[key: string]: T}) => boolean),
        obj: {[key: string]: T}
    ): T | undefined;
    function _find(fn: any, x: any) {
        if (isArray(x))
            return x.find(fn);
        for (const k in x)
            if (fn(x[k], k, x))
                return x[k];
    }
    return _find;
})());

/**
 * Find element's index/key in array or object for which provided function
 * returns `true`
 * (curried function)
 *
 * Until element is found, provided function is called for each element with
 * arguments: current element, current index/key and initial container.
 *
 * If searched element is not found, `undefined` is returned.
 */
export const findIndex = curry((() => {
    function _findIndex<T>(
        fn: ((val: T, index?: number, arr?: T) => boolean),
        arr: T[]
    ): number | undefined;
    function _findIndex<T>(
        fn: ((val: T, key?: string, obj?: {[key: string]: T}) => boolean),
        obj: {[key: string]: T}
    ): string | undefined;
    function _findIndex(fn: any, x: any) {
        if (isArray(x))
            return x.findIndex(fn);
        for (let k in x)
            if (fn(x[k], k, x))
                return k;
    }
    return _findIndex;
})());

/**
 * Concatenate two arrays
 */
export const concat = curry(<T>(
    x: T[],
    y: T[]
): T[] => x.concat(y));

/**
 * Create union of two arrays using `equals` to check equality
 */
export const union = curry(<T>(
    x: T[],
    y: T[]
): T[] => {
    return reduce((acc: T[], val: T) => {
        if (!find(equals(val), x))
            acc = append(val, acc);
        return acc;
    }, x, y);
});

/**
 * Check if array contains value
 *
 * TODO: add support for objects (should we check for keys or values?)
 */
export const contains = curry(<T>(
    val: T,
    arr: T[]
): boolean => arr.includes(val));

/**
 * Insert value into array on specified index
 */
export const insert = curry(<T>(
    idx: number,
    val: T,
    arr: T[]
): T[] => arr.slice(0, idx).concat([val], arr.slice(idx)));

/**
 * Get array slice
 */
export const slice = curry(<T>(
    begin: number,
    end: number,
    arr: T[]
): T[] => arr.slice(begin, end));

/**
 * Reverse array
 */
export function reverse<T>(arr: T[]): T[] {
    return Array.from(arr).reverse();
}

/**
 * Array length
 */
export function length(arr: unknown[]): number {
    return arr.length;
}

/**
 * Increment value
 */
export function inc(val: number): number {
    return val + 1;
}

/**
 * Decrement value
 */
export function dec(val: number): number {
    return val - 1;
}

/**
 * Logical not
 */
export function not(val: any): boolean {
    return !val;
}
