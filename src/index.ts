import type { ChainFactory, ChainFunction, ChainLink, LastChainLink } from './types'

/**
 * A utility class for managing and executing chains of functions.
 */
export class Chain
{
	/**
	 * Recursively executes a chain of functions, starting from the given index.
	 * 
	 * Each function in the chain can call the next function by invoking the `next` parameter.
	 * The chain execution ends when the last function in the chain (of type {@link LastChainLink}) is reached.
	 * 
	 * @template T The base type of the functions in the chain.
	 * @template U The specific type of the last function in the chain, which extends `T`.
	 * 
	 * @param chain The chain of functions to execute, represented as a {@link ChainFactory}.
	 * @param index The starting index for the execution. Defaults to `0`.
	 * 
	 * @returns The result of the chain execution, which is of type `T` or `U`.
	 * 
	 * @throws {Error} If no function is found at the specified index.
	 */
	static functions<
		T extends ChainFunction = ChainFunction,
		U extends ChainFunction = T
	>(
		chain: ChainFactory<T, U>,
		index: number = 0,
	): T | U
	{
		const current = chain[ index ]

		if ( ! current ) {
			throw new Error( `Invalid chain: no function found at index ${ index }` )
		}

		return (
			! Chain.isLast( chain, current, index )
				? current( Chain.functions( chain, index + 1 ) as T )
				: current()
		)

	}


	/**
	 * Determines if the given function is the last function in the chain.
	 * 
	 * This method is used internally to check if the chain execution has reached the final link.
	 * 
	 * @template T The base type of the functions in the chain.
	 * @template U The specific type of the last function in the chain, which extends `T`.
	 * 
	 * @param chain The chain of functions, represented as a {@link ChainFactory}.
	 * @param fn The function to check. Can be a {@link ChainLink} or a {@link LastChainLink}.
	 * @param index The index of the function in the chain. Defaults to `0`.
	 * 
	 * @returns `true` if the given function is the last function in the chain, otherwise `false`.
	 */
	private static isLast<
		T extends ChainFunction = ChainFunction,
		U extends ChainFunction = T
	>(
		chain	: ChainFactory<T, U>,
		fn?		: ChainLink<T> | LastChainLink<U>,
		index	: number = 0,
	): fn is LastChainLink<T>
	{
		return index === chain.length - 1
	}
}