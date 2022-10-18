import { curry } from './curry';
import { isNumber, isString, isArray, isObject, flatten, repeat } from './misc';
import { pipe } from './pipe';


export type JArray = JData[];
export type JObject = {[key: string]: JData};
export type JData = null | boolean | number | string | JArray | JObject;
export type JPath = number | string | JPath[];


/**
 * Get value referenced by path
 *
 * If input value doesn't contain provided path value, `null` is returned.
 */
export const get = curry((
    path: JPath,
    x: JData
): JData => {
    let ret = x;
    for (const i of flatten(path)) {
        if (isNumber(i) && isArray(ret)) {
            ret = ret[i];
        } else if (isString(i) && isObject(ret)) {
            ret = ret[i];
        } else {
            return null;
        }
        if (ret == null)
            return null;
    }
    return ret;
});

/**
 * Change value referenced with path by appling function
 */
export const change = curry((
    path: JPath,
    fn: (val: JData) => JData,
    x: JData
): JData => {
    return (function change(path: JPath[], x: JData) {
        if (path.length < 1)
            return fn(x);
        const [first, ...rest] = path;
        if (isNumber(first)) {
            const ret = (isArray(x) ? Array.from(x) : repeat(null, first));
            ret[first] = change(rest, ret[first]);
            return ret;
        }
        if (isString(first)) {
            const ret = (isObject(x) ? Object.assign({}, x) : {});
            ret[first] = change(rest, ret[first]);
            return ret;
        }
        throw Error('invalid path');
    })(flatten(path), x);
});

/**
 * Replace value referenced with path with another value
 */
export const set = curry((
    path: JPath,
    val: JData,
    x: JData
): JData => change(path, (_: JData) => val, x));

/**
 * Omitting value referenced by path
 */
export const omit = curry((
    path: JPath,
    x: JData
): JData => {
    function _omit(path: (number | string)[], x: JData) {
        if (isNumber(path[0])) {
            if (!isArray(x))
                return x;
            const ret = Array.from(x);
            if (path.length > 1) {
                ret[path[0]] = _omit(path.slice(1), ret[path[0]]);
            } else {
                ret.splice(path[0], 1);
            }
            return ret;
        }
        if (isString(path[0])) {
            if (!isObject(x))
                return x;
            const ret = Object.assign({}, x);
            if (path.length > 1) {
                ret[path[0]] = _omit(path.slice(1), ret[path[0]]);
            } else {
                delete ret[path[0]];
            }
            return ret;
        }
        throw Error('invalid path');
    }
    const flatPath = flatten(path);
    if (flatPath.length < 1)
        return null;
    return _omit(flatPath, x);
});

/**
 * Change by moving value from source path to destination path
 */
export const move = curry((
    srcPath: JPath,
    dstPath: JPath,
    x: JData
): JData => pipe(
    set(dstPath, get(srcPath, x)),
    omit(srcPath)
)(x));
