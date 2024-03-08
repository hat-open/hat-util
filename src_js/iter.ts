import { curry, Curried1, Curried2, Curried3 } from './curry.js';


export function* _islice<T>(
    start: number,
    stop: number | null,
    x: T[]
): Generator<T> {
    if (start < 0) {
        start = x.length + start;
        if (start < 0)
            start = 0;
    }
    if (stop == null || stop > x.length) {
        stop = x.length;
    } else if (stop < 0) {
        stop = x.length + stop;
    }
    for (let i = start; i < stop; ++i)
        yield x[i];
}

export const islice = curry(_islice) as {
    <T>(): Curried3<number, number | null, T[], Generator<T>>;
    <T>(begin: number): Curried2<number | null, T[], Generator<T>>;
    <T>(begin: number, end: number | null): Curried1<T[], Generator<T>>;
    <T>(begin: number, end: number | null, arr: T[]): Generator<T>;
};
