/**
 * Represents any callable function that can be invoked as part of the chain.
 * 
 */
export type ChainFunction = CallableFunction


/**
 * Represents a single link in a chain of functions.
 * 
 * @template T The type of the function being chained.
 * @param next The next function in the chain.
 * @returns A function that can be invoked as part of the chain.
 */
export type ChainLink<T extends ChainFunction = ChainFunction> = ( next: T ) => T


/**
 * Represents the last link in a chain of functions.
 * 
 * Unlike {@link ChainLink}, the last link does not receive a `next` function as an argument.
 * 
 * @template T The type of the function being chained.
 * @returns A function that can be invoked as part of the chain.
 */
export type LastChainLink<T extends ChainFunction = ChainFunction> = () => T


/**
 * Represents the complete chain of functions as an array.
 * 
 * The array can contain any number of {@link ChainLink} functions, but the last element must be a {@link LastChainLink}.
 * 
 * For chains containing a single function, use {@link LastChainLink} directly.
 * 
 * @template T The base type of the chain's functions.
 * @template U The specific type of the last function in the chain, which extends `T`.
 * 
 * By default, `U` is the same as `T`, but it can be specified explicitly if the last function has a different type.
 */
export type ChainFactory<T extends ChainFunction = ChainFunction, U extends ChainFunction = T> = [ ...ChainLink<T>[], LastChainLink<U> ]