import { ProtectedHooks } from "$lib/index.js";
import { sequence } from "@sveltejs/kit/hooks";

const protectedHooks = new ProtectedHooks('test', [
    { protected: '/admin', fallback: '/error?r=admin' }
]);

export const handle = sequence(protectedHooks.handle)