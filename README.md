# @kevinap29/sveltekit-lib

A SvelteKit library providing helpers, hooks, services, and types for building robust SvelteKit applications.

## Installation

```sh
npm install @kevinap29/sveltekit-lib
```

## Features

- JWT authentication helpers ([`JWTHelper`](src/lib/helpers/jwt-helper.ts))
- Protected and header hooks for SvelteKit ([`ProtectedHooks`](src/lib/hooks/protected-hooks.ts), [`HeaderHooks`](src/lib/hooks/header-hooks.ts))
- HTTP service with caching and robots.txt support ([`httpRequest`](src/lib/services/http-service.ts))
- Local storage state manager ([`LocalStorageState`](src/lib/states/local-storage-state.ts))
- Universal JSON parsing/stringifying ([`safeParseJson`](src/lib/helpers/json-helper.ts), [`safeStringifyJson`](src/lib/helpers/json-helper.ts))
- Strongly typed interfaces for endpoints, payloads, and HTTP ([`types`](src/lib/types/index.ts))

## Usage

### JWT Helper

```ts
import { JWTHelper } from '@kevinap29/sveltekit-lib/helpers';

const token = await JWTHelper.generate('your-secret', { email: 'user@example.com', role: 'admin' });
const payload = await JWTHelper.verify(token, 'your-secret');
```

### Protected SvelteKit Endpoints

```ts
import { ProtectedHooks } from '@kevinap29/sveltekit-lib/hooks';
import { sequence } from '@sveltejs/kit/hooks';

const protectedHooks = new ProtectedHooks('your-secret', [
	{ protected: '/admin', fallback: '/error?r=admin' }
]);

export const handle = sequence(protectedHooks.handle);
```

### HTTP Service

```ts
import { httpRequest } from '@kevinap29/sveltekit-lib/services';

const response = await httpRequest(
	{
		fetch,
		input: 'https://api.example.com/data'
	},
	{ type: 'json', checkRobots: false }
);

if (response.success) {
	console.log(response.value);
}
```

### Local Storage State

```ts
import { LocalStorageState } from '@kevinap29/sveltekit-lib/states';

const localStorageState = new LocalStorageState();
localStorageState.set('test', '1234');
```

## Types

See [`src/lib/types/index.ts`](src/lib/types/index.ts) for all exported types.

## License

MIT

## Donate

[![Buy Me Coffee](https://img.shields.io/badge/Buy%20Me%20Coffee-FFD140?style=for-the-badge&logo=paypal&logoColor=black)](https://www.paypal.com/ncp/payment/GZKMJH6QPVGSC)
