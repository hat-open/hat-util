
export type Curried0<TResult> = {
    (): TResult;
};

export type Curried1<T1, TResult> = {
    (): Curried1<T1, TResult>;
    (x1: T1): TResult;
};

export type Curried2<T1, T2, TResult> = {
    (): Curried2<T1, T2, TResult>;
    (x1: T1): Curried1<T2, TResult>;
    (x1: T1, x2: T2): TResult;
};

export type Curried3<T1, T2, T3, TResult> = {
    (): Curried3<T1, T2, T3, TResult>;
    (x1: T1): Curried2<T2, T3, TResult>;
    (x1: T1, x2: T2): Curried1<T3, TResult>;
    (x1: T1, x2: T2, x3: T3): TResult;
};

export type Curried4<T1, T2, T3, T4, TResult> = {
    (): Curried4<T1, T2, T3, T4, TResult>;
    (x1: T1): Curried3<T2, T3, T4, TResult>;
    (x1: T1, x2: T2): Curried2<T3, T4, TResult>;
    (x1: T1, x2: T2, x3: T3): Curried1<T4, TResult>;
    (x1: T1, x2: T2, x3: T3, x4: T4): TResult;
};

export type Curried<TArgs, TResult> =
    TArgs extends [] ?
        Curried0<TResult> :
    TArgs extends [any] ?
        Curried1<TArgs[0], TResult> :
    TArgs extends [any, any] ?
        Curried2<TArgs[0], TArgs[1], TResult> :
    TArgs extends [any, any, any] ?
        Curried3<TArgs[0], TArgs[1], TArgs[2], TResult> :
    TArgs extends [any, any, any, any] ?
        Curried4<TArgs[0], TArgs[1], TArgs[2], TArgs[3], TResult> :
    (...args: any[]) => any;


/**
 * Curry function with fixed arguments lenth
 *
 * Function arity is determined based on function's length property.
 */
export function curry<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => TResult
): Curried<TArgs, TResult> {
    return curryN(fn.length, fn);
}

/**
 * Curry function with fixed arguments lenth
 *
 * Function arity is provided as first argument.
 */
export function curryN<TArgs extends any[], TResult>(
    arity: number,
    fn: (...args: TArgs) => TResult
): Curried<TArgs, TResult> {
    function wrapper(prevArgs: any) {
        return function(...args: any[]) {
            const allArgs = [...prevArgs, ...args];
            if (allArgs.length >= arity)
                return fn(...(allArgs as TArgs));
            return wrapper(allArgs);
        };
    }
    return wrapper([]) as Curried<TArgs, TResult>;
}
