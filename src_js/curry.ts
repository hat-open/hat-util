

// TODO find solution for curry function type accepting generic functions

/*
 * Curry function with fixed arguments lenth
 *
 * Function arity is determined based on function's length property.
 */
export function curry(fn: Function): Function {
    function wrapper(prevArgs: any) {
        return function(...args: any[]) {
            const allArgs = [...prevArgs, ...args];
            if (args.length >= fn.length)
                return fn(...allArgs);
            return wrapper(allArgs);
        };
    }
    return wrapper([]);
}



///////////////////////////////////////////////////////////////////////////


// solution from
// https://medium.com/codex/currying-in-typescript-ca5226c85b85


// type PartialTuple<
//     TUPLE extends any[],
//     EXTRACTED extends any[] = []
// > =
//     TUPLE extends [infer NEXT_PARAM, ...infer REMAINING] ?
//         PartialTuple<REMAINING, [...EXTRACTED, NEXT_PARAM?]> :
//         [...EXTRACTED, ...TUPLE];

// type PartialParameters<
//     FN extends (...args: any[]) => any
// > = PartialTuple<Parameters<FN>>;

// type RemainingParameters<
//     PROVIDED extends any[],
//     EXPECTED extends any[]
// > =
//     EXPECTED extends [infer E1, ...infer EX] ?
//         PROVIDED extends [infer P1, ...infer PX] ?
//             P1 extends E1 ?
//                 RemainingParameters<PX, EX> :
//                 never :
//             EXPECTED :
//         [];

// type CurriedFunction<
//     PROVIDED extends any[],
//     FN extends (...args: any[]) => any
// > =
//     <NEW_ARGS extends PartialTuple<
//         RemainingParameters<PROVIDED, Parameters<FN>>
//     >>(...args: NEW_ARGS) =>
//         CurriedFunctionOrReturnValue<[...PROVIDED, ...NEW_ARGS], FN>;

// type CurriedFunctionOrReturnValue<
//     PROVIDED extends any[],
//     FN extends (...args: any[]) => any
// > =
//     RemainingParameters<PROVIDED, Parameters<FN>> extends [any, ...any[]] ?
//         CurriedFunction<PROVIDED, FN> :
//         ReturnType<FN>;


// export function curry<
//     FN extends (...args: any[]) => any,
//     STARTING_ARGS extends PartialParameters<FN>
// >(
//     fn: FN,
//     ...existingArgs: STARTING_ARGS
// ): CurriedFunction<STARTING_ARGS, FN> {
//     return function(...args) {
//         const allArgs = [...existingArgs, ...args];
//         if (args.length >= fn.length)
//             return fn(...allArgs);
//         return curry(fn, ...allArgs as PartialParameters<FN>);
//     };
// }



////////////////////////////////////////////////////////////////////////

// import {F} from 'ts-toolbelt';


// export function curry<Fn extends F.Function>(fn: Fn): F.Curry<Fn> {
//     function wrapper(prevArgs: any) {
//         return function(...args: any[]) {
//             const allArgs = [...prevArgs, ...args];
//             if (args.length >= fn.length)
//                 return fn(...allArgs);
//             return wrapper(allArgs);
//         };
//     }
//     return wrapper([]) as F.Curry<Fn>;
// }
