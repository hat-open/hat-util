
export interface Future<T> extends Promise<T> {
    done: () => boolean;
    result: () => T;
    setResult: (result: T) => void;
    setError: (error: any) => void;
}

/**
 * Create promise that resolves in `t` milliseconds
 */
export function sleep(t: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(() => { resolve(); }, t);
    });
}

/**
 * Delay function call `fn(...args)` for `t` milliseconds
 */
export function delay<TArgs extends [...any[]], TResult>(
    fn: (...args: TArgs) => TResult,
    t = 0,
    ...args: TArgs
): Promise<TResult> {
    return new Promise(resolve => {
        setTimeout(() => { resolve(fn(...args)); }, t);
    });
}

/**
 * Create new future instance
 */
export function createFuture<T>(): Future<T> {
    const data = {
        done: false,
        error: false,
        result: undefined as any,
        resolve: null as ((value: T) => void) | null,
        reject: null as ((reason: any) => void) | null
    };

    const future = new Promise((resolve, reject) => {
        data.resolve = resolve;
        data.reject = reject;
        if (data.error) {
            reject(data.result);
        } else if (data.done) {
            resolve(data.result);
        }
    }) as Future<T>;

    future.done = () => data.done;

    future.result = () => {
        if (!data.done)
            throw new Error('future is not done');
        if (data.error)
            throw data.error;
        return data.result;
    };

    future.setResult = result => {
        if (data.done)
            throw new Error('result already set');
        data.result = result;
        data.done = true;
        if (data.resolve)
            data.resolve(data.result);
    };

    future.setError = error => {
        if (data.done)
            throw new Error('result already set');
        data.error = true;
        data.result = error;
        data.done = true;
        if (data.reject)
            data.reject(error);
    };

    return future;
}
