import Chain from '@/index';
import type { ChainFactory, ChainLink, LastChainLink } from '@/types';

type ChainFunction = () => string

describe( 'Chain', () => {

	it( 'executes a chain of functions in order', () => {
		
		const func1	= jest.fn( ( next: ChainFunction ) => `1-${ next() }` )
		const func2	= jest.fn( ( next: ChainFunction ) => `2-${ next() }` )
		const func3	= jest.fn( () => 'end' )
		const test1: ChainLink<ChainFunction> = ( next ) => () => func1( next )
		const test2: ChainLink<ChainFunction> = ( next ) => () => func2( next )
		const test3: LastChainLink<ChainFunction> = () => func3


		const chain: ChainFactory<ChainFunction> = [ test1, test2, test3 ]
		const result = Chain.functions( chain )()

		expect( result ).toBe( '1-2-end' )
		expect( func1 ).toHaveBeenCalledTimes( 1 )
		expect( func2 ).toHaveBeenCalledTimes( 1 )
		expect( func3 ).toHaveBeenCalledTimes( 1 )

	} )


	it( 'handles a chain with a single function', () => {

		const func1 = jest.fn( () => 'end' )
		const test1: LastChainLink<ChainFunction> = () => func1

		const chain: ChainFactory<ChainFunction> = [ test1 ]
		const result = Chain.functions( chain )()

		expect( result ).toBe( 'end' )
		expect( func1 ).toHaveBeenCalledTimes( 1 )
		
	} )


	it( 'throws an error for an empty chain', () => {
		// @ts-expect-error negative testing
		expect( () => Chain.functions( [] )() )
			.toThrow( 'Invalid chain: no function found at index 0' )
	} )


	it( 'identifies the last function in the chain', () => {
		const test1: ChainLink<() => void> = ( next ) => () => next()
		const test2: LastChainLink<ChainFunction> = () => () => 'end'

		const func1	= jest.fn( test1 )
		const func2	= jest.fn( test2 )

		const chain: ChainFactory<() => void, ChainFunction> = [ func1, func2 ]
		const isLast = Chain[ 'isLast' ]( chain, func2, 1 )

		expect( isLast ).toBe( true )
	} )


	it( 'allows last chain link to have a custom return type', () => {
		type LastChainFunction = () => boolean

		const test1: ChainLink<ChainFunction> = next => () => `1-${ next() }`
		const test2: ChainLink<ChainFunction> = next => () => `2-${ next() }`
		const test3: LastChainLink<LastChainFunction> = () => () => true

		const chain: ChainFactory<ChainFunction, LastChainFunction> = [ test1, test2, test3 ]
		const result = Chain.functions( chain )()

		expect( result ).toBe( '1-2-true' )
	} )


	it( 'allows chain functions to interrupt the chain', () => {

		type ChainFunctionProps = {
			someProperty	: string
			firstFunction?	: boolean
			secondFunction?	: boolean
			thirdFunction?	: boolean
		}
		type ChainFunction = ( props: ChainFunctionProps ) => ChainFunctionProps

		const func1: ChainLink<ChainFunction> = ( next ) => ( props ) => {
			props.someProperty	= 'Edited by 1st function'
			props.firstFunction	= true
			return next( props )
		}

		const func2: ChainLink<ChainFunction> = ( next ) => ( props ) => {
			if ( props.someProperty === 'Edited by 1st function' ) {
				props.secondFunction = true
				return props
			}

			props.secondFunction = true
			return next( props )
		}

		const test3: ChainFunction = jest.fn( ( props ) => {
			props.thirdFunction = true
			return props
		} )
		const func3: LastChainLink<ChainFunction> = () => test3

		const chain: ChainFactory<ChainFunction> = [ func1, func2, func3 ]

		const result = Chain.functions( chain )( {
			someProperty	: 'Initial value',
			firstFunction	: false,
			secondFunction	: false,
			thirdFunction	: false,
		} )

		expect( result.thirdFunction ).toBe( false )
		expect( test3 ).toHaveBeenCalledTimes( 0 )

	} )


	it( 'supports chained functions with promises', async () => {
		type ChainFunctionProps = {
			someProperty	: string
			firstFunction?	: boolean
			secondFunction?	: boolean
			thirdFunction?	: boolean
		}
		type ChainFunction = ( props: ChainFunctionProps ) => ChainFunctionProps | Promise<ChainFunctionProps>

		// Mock functions to track their execution order
		const mockFunc1 = jest.fn()
		const mockFunc2 = jest.fn()

		const func1: ChainLink<ChainFunction> = ( next ) => async ( props ) => {
			mockFunc1()
			await new Promise( resolve => setTimeout( resolve, 10 ) )
			props.someProperty	= 'Edited by 1st function'
			props.firstFunction	= true
			return next( props )
		}
		const func2: LastChainLink<ChainFunction> = () => ( props ) => {
			mockFunc2()
			props.secondFunction = true
			return props
		}

		const chain: ChainFactory<ChainFunction> = [ func1, func2 ]

		const result = Chain.functions( chain )( {
			someProperty	: 'Initial value',
			firstFunction	: false,
			secondFunction	: false,
		} )

		expect( result ).toBeInstanceOf( Promise )
		// Ensure func1 was called before awaiting
		expect( mockFunc1 ).toHaveBeenCalledTimes( 1 )
		expect( mockFunc2 ).not.toHaveBeenCalled()
		
		await expect( result ).resolves.toEqual( {
			someProperty	: 'Edited by 1st function',
			firstFunction	: true,
			secondFunction	: true,
		} )
		expect( mockFunc2 ).toHaveBeenCalledTimes( 1 )
	} )

} )