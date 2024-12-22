# Chain Functions ⛓️

Version 0.1.0-alpha.1

## Functions chaining made easy

The `Chain` class provides a utility for managing and executing chains of functions. Each function in the chain can optionally invoke the next function, enabling a flexible and composable flow of execution. This is particularly useful for scenarios such as middleware processing, data transformations, or handling asynchronous operations in a structured manner.

### Table of Contents

- [Getting started](#getting-started)
- [API Reference](#api-reference)
	- [`Chain` class](#chain-class)
	- [Types](#types)
- [Key Features](#key-features)
- [Examples](#examples)
- [Development](#development)
	- [ESLint](#eslint)
	- [Jest](#jest)
- [Contributing](#contributing)
- [Security](#security)
- [Credits](#made-with-)

---

### Getting started

Run the following command to start using `chain-functions` in your projects:

```bash
npm i @alessiofrittoli/chain-functions
```

or using `pnpm`

```bash
pnpm i @alessiofrittoli/chain-functions
```

---

### API Reference

#### `Chain` class

A utility class for managing and executing chains of functions.

##### Static Methods

###### `Chain.functions()`

Recursively executes a chain of functions.

<details>

<summary>Parameters</summary>

| Parameter | Type                 | Default | Description |
|-----------|----------------------|---------|-------------|
| `chain`   | `ChainFactory<T, U>` | -       | The chain of functions to execute. This must be an array of functions (`ChainLink<T>`), where the last function is of type LastChainLink. See [Types](#types) section for further informations about. |
| `index`   | `number`             | `0`     | (Optional) The starting index for execution. |

</details>

---

<details>

<summary>Returns</summary>

Type: `T | U`

The result of the chain execution, which matches the type of the chain's functions (`T` or `U`).

See [Types](#types) section for further informations about.

</details>

---

<details>

<summary>Throws</summary>

`Error` if no function is found at the specified index.

</details>

---

<details>

<summary>Example</summary>

```ts
import Chain from '@alessiofrittoli/chain-functions'
import type { ChainLink, LastChainLink, ChainFactory } from '@alessiofrittoli/chain-functions/types'

type ChainFunction = () => string

const function1: ChainLink<ChainFunction> = next => () => `1-${ next() }`
const function2: ChainLink<ChainFunction> = next => () => `2-${ next() }`
const function3: LastChainLink<ChainFunction> = () => () => 'end'

const chain: ChainFactory<ChainFunction> = [ function1, function2, function3 ]
const result = Chain.functions( chain )()

console.log( result ) // Output: '1-2-end'
```

</details>

---

###### `Chain.isLast()`

Determines if the given function is the last function in the chain needed to type cast the last function with `LastChainLink<U>`.

This method is primarily used internally by the `Chain.functions()` method to determine when the chain execution should terminate.

<details>

<summary>Parameters</summary>

| Parameter | Type                 | Default | Description |
|-----------|----------------------|---------|-------------|
| `chain`   | `ChainFactory<T, U>` | -       | The chain of functions. See [Types](#types) section for further informations about. |
| `fn`      | `ChainLink<T> \| LastChainLink<U>` | -       | The function to type cast. This can be either a regular chain link or the last chain link. See [Types](#types) section for further informations about. |
| `index`   | `number`             | `0`     | (Optional) The current index of the function in the `Chain.functions()` recursion. |

</details>

---

<details>

<summary>Returns</summary>

Type: `boolean`

Returns `true` if the given function is the last function in the chain, `false` otherwise.

</details>

---

#### Types

##### `ChainFunction`

Represents any callable function that can be invoked as part of the chain.

This is used internally to type cast other types `template` parameters.

##### `ChainLink<T extends ChainFunction = ChainFunction>`

Represents a single link in a chain of functions.

<details>

<summary>Parameters</summary>

| Parameter | Type | Description                                                             |
|-----------|------|-------------------------------------------------------------------------|
| `next`    | `T`  | The next function in the chain. Its return type must be of type of `T`. |

</details>

---

<details>

<summary>Returns</summary>

Type: `T`

A function that can be invoked as part of the chain.

</details>

---

##### `LastChainLink<T extends ChainFunction = ChainFunction>`

Represents the last link in a chain of functions. Unlike `ChainLink`, it does not accept a `next` parameter.

<details>

<summary>Returns</summary>

Type: `T`

A function that can be invoked as the final step in the chain.

</details>

---

##### `ChainFactory<T extends ChainFunction = ChainFunction, U extends ChainFunction = T>`

Represents the complete chain of functions as an array.

###### Structure

- Can contain any number of `ChainLink<T>` functions.
- The last element in the array must be a `LastChainLink<U>`.

---

### Key Features

- Chain link functions are highly customizeable.
- Chain link functions can be `async` functions.
- The last chain link could return a different type (`U`) other than `T` from a standard `ChainLink`.

---

### Examples

#### Importing the library

```ts
// importing the main `Chain` class
import Chain from '@alessiofrittoli/chain-functions'
// importing types
import type { ChainLink, LastChainLink, ChainFactory } from '@alessiofrittoli/chain-functions/types'
```

<details>

<summary>Basic usage</summary>

```ts
// define the chain link function type
type ChainFunction = () => string

// declare chain link functions
const function1: ChainLink<ChainFunction> = next => () => `1-${ next() }`
const function2: ChainLink<ChainFunction> = next => () => `2-${ next() }`
// declare the last chain function
const function3: LastChainLink<ChainFunction> = () => () => 'end'

// declare the chain array
const chain: ChainFactory<ChainFunction> = [ function1, function2, function3 ]
// execute the chain array
const result = Chain.functions( chain )()

console.log( result ) // Output: '1-2-end'
```

</details>

---

<details>

<summary>Advance usage</summary>

```ts
type ChainFunctionProps = {
	someProperty	: string
	firstFunction?	: boolean
	secondFunction?	: boolean
	thirdFunction?	: boolean
}
// define the chain link function type
type ChainFunction = ( props: ChainFunctionProps ) => ChainFunctionProps

// declare chain link functions
const function1: ChainLink<ChainFunction> = next => props => {
	// edit properties
	props.someProperty	= 'Edited by 1st function'
	props.firstFunction	= true
	// call the next function in the chain
	return next( props )
}


const function2: ChainLink<ChainFunction> = next => props => {
	props.secondFunction = true

	if ( props.someProperty === 'Edited by 1st function' ) {
		// stop chain execution if some condition is met.
		return props
	}
	
	// call the next function in the chain
	return next( props )
}


// declare the last chain function
const function3: LastChainLink<ChainFunction> = () => props => {
	props.thirdFunction = true
	return props
}

// declare the chain array
const chain: ChainFactory<ChainFunction> = [ function1, function2, function3 ]
// declare the initial state
const initialState: ChainFunctionProps = {
	someProperty	: 'Initial value',
	firstFunction	: false,
	secondFunction	: false,
	thirdFunction	: false,
}
// execute the chain array with initial state
const result = Chain.functions( chain )( initialState )

console.log( result )
// Output: {
// 	someProperty	: 'Edited by 1st function',
// 	firstFunction	: true,
// 	secondFunction	: true,
// 	thirdFunction	: false,
// }
```

</details>

---

<details>

<summary>`LastChainLink` with custom return type</summary>

```ts
type ChainFunction = () => string
type LastChainFunction = () => boolean

const function1: ChainLink<ChainFunction> = next => () => `1-${ next() }`
const function2: ChainLink<ChainFunction> = next => () => `2-${ next() }`
const function3: LastChainLink<LastChainFunction> = () => () => true

const chain: ChainFactory<ChainFunction, LastChainFunction> = [ function1, function2, function3 ]
const result = Chain.functions( chain )()

console.log( result ) // Outputs: '1-2-true'
```

</details>

---

<details>

<summary>`ChainLink` functions with promises</summary>

```ts
type ChainFunction = () => string | Promise<string>

const function1: ChainLink<ChainFunction> = next => async () => {
	// simulate a long task running
	await new Promise<void>( resolve => setTimeout( resolve, 5000 ) )
	return `1-${ next() }`
}
const function2: ChainLink<ChainFunction> = next => (
	// this function is executed once `function1` Promise get resolved.
	() => `2-${ next() }`
)
const function3: LastChainLink<ChainFunction> = () => () => 'end'

const chain: ChainFactory<ChainFunction> = [ function1, function2, function3 ]
const result = Chain.functions( chain )() // `result` is now a promise

console.log( await result ) // Outputs: '1-2-end'
```

</details>

---

<details>

<summary>Next.js middleware chain</summary>

```ts
// src/middleware.ts

import { NextMiddleware, NextResponse } from 'next/server'
import type { ChainFactory, ChainLink, LastChainLink } from '@alessiofrittoli/chain-functions/types'

type Middleware = ChainLink<NextMiddleware>
type LastMiddleware = () => NextResponse<unknown>
type MiddlewareFactory = ChainFactory<NextMiddleware, LastMiddleware>

const middleware1: Middleware = next => (
	async ( request, event ) => {
		
		const { nextUrl } = request

		if ( nextUrl === '...' ) {
			const rewriteUrl = '...'
			return (
				NextResponse
					.rewrite( rewriteUrl )
			)
		}

		return next( request, event )

	}
)


const middleware2: Middleware = next => (
	async ( request, event ) => {
		
		const response = await next( request, event )

		// do something with `response` returned by the next middleware.
		// ...

		return response
	}
)

// ensures `NextResponse.next()` is called if no one stops the chain.
const lastMiddleware: LastChainLink<LastMiddleware> = () => () => NextResponse.next()

const middlewares: MiddlewareFactory = [ middleware1, middleware2, lastMiddleware ]

export const config = {
	matcher: [
		/**
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api/|_next|.*\\..*).*)',
	]
}

// note that we do not execute the chain like in the previous examples since Next.js is responsible for the execution, providing `request` and `event` parameters to the `middleware` functions.
export default Chain.functions( middlewares )
```

</details>

---

### Development

#### Install depenendencies

```bash
npm install
```

or using `pnpm`

```bash
pnpm i
```

#### Build your source code

Run the following command to build code for distribution.

```bash
pnpm build
```

#### [ESLint](https://www.npmjs.com/package/eslint)

warnings / errors check.

```bash
pnpm lint
```

#### [Jest](https://npmjs.com/package/jest)

Run all the defined test suites by running the following:

```bash
# Run tests and watch file changes.
pnpm test

# Run tests and watch file changes with jest-environment-jsdom.
pnpm test:jsdom

# Run tests in a CI environment.
pnpm test:ci

# Run tests in a CI environment with jest-environment-jsdom.
pnpm test:ci:jsdom
```

You can eventually run specific suits like so:

```bash
pnpm test:jest
pnpm test:jest:jsdom
```

Run tests with coverage.

An HTTP server is then started to serve coverage files from `./coverage` folder.

⚠️ You may see a blank page the first time you run this command. Simply refresh the browser to see the updates.

```bash
pnpm test:coverage
```

---

### Contributing

Contributions are truly welcome!\
Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

---

### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

### Made with ☕

<table style='display:flex;gap:20px;'>
	<tbody>
		<tr>
			<td>
				<img src='https://avatars.githubusercontent.com/u/35973186' style='width:60px;border-radius:50%;object-fit:contain;'>
			</td>
			<td>
				<table style='display:flex;gap:2px;flex-direction:column;'>
					<tbody>
						<tr>
							<td>
								<a href='https://github.com/alessiofrittoli' target='_blank' rel='noopener'>Alessio Frittoli</a>
							</td>
						</tr>
						<tr>
							<td>
								<small>
									<a href='https://alessiofrittoli.it' target='_blank' rel='noopener'>https://alessiofrittoli.it</a> |
									<a href='mailto:info@alessiofrittoli.it' target='_blank' rel='noopener'>info@alessiofrittoli.it</a>
								</small>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>