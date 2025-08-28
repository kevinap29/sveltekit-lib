# @kevinap29/sveltekit-lib

A comprehensive SvelteKit utility library providing type-safe helpers, hooks, services, and utilities for building robust SvelteKit applications.

[![npm version](https://badge.fury.io/js/@kevinap29%2Fsveltekit-lib.svg)](https://www.npmjs.com/package/@kevinap29/sveltekit-lib)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```sh
npm install @kevinap29/sveltekit-lib
```

## Core Features

- 🔒 **JWT Authentication** - Secure token generation and verification
- 🛡️ **Protected Routes** - Route protection with fallback redirects
- 🌐 **HTTP Service** - Typed HTTP client with caching and robots.txt support
- 💾 **Local Storage** - Type-safe browser storage management
- 🔄 **JSON Utilities** - Safe JSON parsing and stringifying
- 📝 **TypeScript Support** - Full type safety and IntelliSense support

## Documentation

### JWT Authentication

```ts
 import { JWTHelper } from '@kevinap29/sveltekit-lib/helpers';

// Generate token 
const token = await JWTHelper.generate('your-secret', { email: 'user@example.com', role: 'admin' });

// Verify token 
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

const { success, value, error } = await httpRequest({ fetch, input: 'https://api.example.com/data', options: { method: 'POST', body: JSON.stringify({ foo: 'bar' }) } }, { type: 'json', checkRobots: true });
```

### Cookies Service

A type-safe wrapper for SvelteKit's cookie management with standardized responses.

```typescript 
import { CookiesService } from '@kevinap29/sveltekit-lib/services';

// Create a new CookiesService instance in a SvelteKit endpoint or load function 
export const load = ({ cookies }) => { 
	const cookieService = new CookiesService(cookies);
	// Set a cookie with custom options 
	cookieService.set({ 
		name: 'user-token', 
		value: 'abc123', 
		path: '/', 
		maxAge: 60 * 60 * 24, 
		secure: true, 
		sameSite: 'lax' 
	});

	// Get and parse a cookie value 
	const { success, data } = cookieService.get<{ id: string }>('user-data');

	// Delete a cookie 
	cookieService.delete('session-id');

	// Rest of your code
}
```

#### Features

- Type-safe cookie operations
- Standardized response format
- JSON parsing of cookie values
- Configurable security options

#### Methods

| Method   | Description                                     | Example                                                      |
|----------|-------------------------------------------------|--------------------------------------------------------------|
| `set`    | Sets a cookie with the provided data            | `cookieService.set({ name: 'token', value: 'abc', path: '/' })` |
| `get`    | Gets and optionally parses a cookie value       | `cookieService.get<UserData>('user-data')`                   |
| `delete` | Deletes a cookie by name                        | `cookieService.delete('session-id')`                         |

#### Cookie Options

| Option      | Type                      | Default     | Description                                       |
|-------------|---------------------------|-------------|---------------------------------------------------|
| `name`      | string                    | (required)  | The name of the cookie                            |
| `value`     | string                    | (required)  | The value to be stored in the cookie              |
| `path`      | string                    | (required)  | The path on the server for which the cookie is valid |
| `maxAge`    | number                    | 30 days     | The maximum age of the cookie in seconds          |
| `noMaxAge`  | boolean                   | false       | If true, the cookie will not have a max age set   |
| `secure`    | boolean                   | true        | If true, the cookie will only be sent over HTTPS  |
| `sameSite`  | 'lax' \| 'strict' \| 'none' | 'lax'      | Controls whether the cookie is sent with cross-site requests |

### Local Storage State

```ts
import { browser } from '$app/environment'; import { LocalStorageState } from '@kevinap29/sveltekit-lib/states';

const storage = new LocalStorageState();

// Initialize in browser environment 
storage.init(browser ? localStorage : null);

// Use storage 
storage.set('user-preferences', { theme: 'dark' }); const prefs = storage.get('user-preferences');
```

### SEO Component

The library includes a powerful SEO component for managing meta tags in your SvelteKit applications.

The SEO component automatically generates:
- Standard meta tags
- Open Graph tags
- Twitter Card tags

#### Props

| Property      | Type       | Required | Description                                     |
|--------------|------------|----------|-------------------------------------------------|
| title        | string     | Yes      | Page title and OG/Twitter title                 |
| description  | string     | Yes      | Page description for search engines and socials |
| keywords     | string[]   | No       | Keywords for search engines                     |
| author       | string     | No       | Content author name                             |
| image        | string     | Yes      | OG/Twitter preview image URL                    |
| url          | string     | Yes      | Canonical URL of the page                       |
| type         | string     | No       | OG type (defaults to "website")                 |

#### Example Usage in a SvelteKit Page

```html
<script lang="ts"> 
	import { Seo } from '@kevinap29/sveltekit-lib/components'; 

	const pageData = { 
		title: "My Blog Post", 
		description: "An interesting article about SvelteKit development",
		 keywords: ["sveltekit", "development", "tutorial"], 
		 author: "John Doe", 
		 image: "https://mysite.com/blog-preview.jpg", 
		 url: "https://mysite.com/blog/post-1", 
		 type: "article" }; 
</script> 

<Seo data={pageData} /> 

<h1>My Blog Post</h1> 

<!-- Rest of your page content --> ▲
```

### Cache Service

A flexible in-memory caching solution with automatic expiration.

#### Features

- Generic typing for type-safe caching
- Automatic cache expiration
- Memory-efficient storage
- Simple API for cache management

#### Methods

| Method  | Description                                          | Example                                        |
|---------|------------------------------------------------------|------------------------------------------------|
| `get`   | Retrieves cached data (returns null if expired)       | `cache.get('user-123')`                        |
| `set`   | Stores data with optional message                     | `cache.set('user-123', userData, 'User cache')` |
| `delete`| Removes specific cache entry                          | `cache.delete('user-123')`                      |
| `clear` | Clears all cached data                               | `cache.clear()`                                 |

#### Example Usage

```ts
import { CacheService } from '@kevinap29/sveltekit-lib/services';

// Define your data type 
interface UserData { id: string; name: string; email: string; }

// Initialize cache with 5 minutes TTL 
const userCache = new CacheService<UserData>(5 * 60 * 1000);

// Cache user data 
userCache.set('user-123', { id: '123', name: 'John Doe', email: 'john@example.com' });

// Retrieve cached data 
const cachedUser = userCache.get('user-123'); 
if (cachedUser) { 
	console.log('Cached user:', cachedUser.data); 
	console.log('Cache timestamp:', new Date(cachedUser.timestamp));
	console.log('Cache message:', cachedUser.message); 
}

// Clear specific cache 
userCache.delete('user-123');

// Clear all cache 
userCache.clear();
```

## Types

See [`src/lib/types/index.ts`](src/lib/types/index.ts) for all exported types.

## TypeScript Support

This library is written in TypeScript and includes comprehensive type definitions. View all available types in the [type definitions](src/lib/types/index.ts).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE) © @mainapidev/@kevinap29

## Support

If you find this library helpful, consider supporting the development:

[![Buy Me Coffee](https://img.shields.io/badge/Buy%20Me%20Coffee-FFD140?style=for-the-badge&logo=paypal&logoColor=black)](https://www.paypal.com/ncp/payment/GZKMJH6QPVGSC)
