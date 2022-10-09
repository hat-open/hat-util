
// TODO write type


/**
 * Pipe function calls
 *
 * Pipe provides functional composition with reversed order. First function
 * may have any arity and all other functions are called with only single
 * argument (result from previous function application).
 *
 * In case when first function is not provided, pipe returns identity function.
 */
export function pipe<T extends any[]>(
    first?: (...args: T) => any,
    ...rest: ((arg: any) => any)[]
): ((...args: T) => any) {
    return function (...args: T) {
        if (!first)
            return args[0];
        // @ts-ignore
        let ret = first.apply(this, args);
        for (const fn of rest)
            ret = fn(ret);
        return ret;
    };
}
