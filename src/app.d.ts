// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { ExtendJWTPayload } from '$lib/types/index.ts';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: ExtendJWTPayload;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
