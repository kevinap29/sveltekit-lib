# @kevinap29/sveltekit-lib

A SvelteKit library for JWT authentication, protected hooks, and utility helpers.  
Preview and showcase your package with SvelteKit.

## Installation

```sh
npm install @kevinap29/sveltekit-lib
```

## Features

- JWT authentication helpers ([`JWTHelper`](src/lib/helpers/jwt-helper.ts))
- SvelteKit endpoint protection ([`ProtectedHooks`](src/lib/hooks/protected-hooks.ts))
- Type definitions for JWT and hooks ([`types`](src/lib/types/index.ts))

## Usage

### JWT Helper

```ts
import { JWTHelper } from '@kevinap29/sveltekit-lib';

const token = await JWTHelper.generate('my-secret', { role: 'admin', email: 'user@example.com' }, '1h');
const payload = await JWTHelper.verify(token, 'my-secret');
```

### Protected SvelteKit Endpoints

```ts
import { ProtectedHooks } from '@kevinap29/sveltekit-lib';

const protectedHooks = new ProtectedHooks('my-secret', [
  { protected: '/admin', fallback: '/login' }
]);

export const handle = protectedHooks.handle;
```

Add to your `src/app.d.ts`:

```ts
import type { ExtendJWTPayload } from '@kevinap29/sveltekit-lib';

declare global {
  namespace App {
    interface Locals {
      user?: ExtendJWTPayload;
    }
  }
}
```

## Development

- Run dev server: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`

## License

MIT