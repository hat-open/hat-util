
type Fn<TArg, TResult> = (x: TArg) => TResult;

type Chain<TArg, TFns> =
    TFns extends [] ?
        [] :
    TFns extends [Fn<TArg, any>] ?
        TFns :
    TFns extends [Fn<TArg, infer TResult>, ...infer TRest] ?
        [Fn<TArg, TResult>, ...Chain<TResult, TRest>] :
    never;

type Result<TArg, TFns> =
    TFns extends [] ?
        TArg :
    TFns extends [Fn<TArg, infer TResult>] ?
        TResult :
    TFns extends [Fn<TArg, infer TResult>, ...infer TRest] ?
        Result<TResult, TRest> :
    never;


/**
 * Pipe function calls
 *
 * Pipe provides functional composition with reversed order. First function
 * may have any arity and all other functions are called with only single
 * argument (result from previous function application).
 *
 * In case when first function is not provided, pipe returns identity function.
 */
export function pipe(): {<T>(x: T): T};
export function pipe<TArgs extends any[], TFirstResult, TFns>(
    first: (...args: TArgs) => TFirstResult,
    ...rest: Chain<TFirstResult, TFns>
): (...args: TArgs) => Result<TFirstResult, TFns>;
export function pipe(first?: any, ...rest: any[]) {
    return function (...args: any[]) {
        if (!first)
            return args[0];
        // @ts-ignore
        let ret = first.apply(this, args);
        for (const fn of rest)
            ret = fn(ret);
        return ret;
    };
}
