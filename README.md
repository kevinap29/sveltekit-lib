# SvelteKit Lib Documentation

A utility library for SvelteKit projects providing JWT helpers, request hooks, and type definitions.

## 📦 Installation

```bash
npm install @kevinap29/sveltekit-lib
```

or using pnpm:

```bash
pnpm add @kevinap29/sveltekit-lib
```

## 🚀 Usage

Import modules from the package:

```ts
import { verifyToken, signToken } from "@kevinap29/sveltekit-lib/helpers";
import { protectedHandle } from "@kevinap29/sveltekit-lib/hooks";
import type { JwtPayload } from "@kevinap29/sveltekit-lib/types";
```

---

## 📚 API Reference

### 1. Helpers (`@kevinap29/sveltekit-lib/helpers`)

#### `signToken(payload: object, secret: string, options?: { expiresIn?: string | number }): string`

Signs a payload and returns a JWT.

**Parameters:**

- `payload` – The object to sign.
- `secret` – Secret key for signing.
- `options.expiresIn` – Expiration time (e.g., `"1h"`, `3600`).

**Returns:** A signed JWT string.

**Example:**

```ts
import { signToken } from "@kevinap29/sveltekit-lib/helpers";

const token = signToken({ userId: 123 }, "my-secret", { expiresIn: "1h" });
console.log(token);
```

---

#### `verifyToken<T = object>(token: string, secret: string): T`

Verifies a JWT and returns the decoded payload.

**Parameters:**

- `token` – The JWT string.
- `secret` – The secret key used for verification.

**Returns:** Decoded payload as type `T`.

**Example:**

```ts
import { verifyToken } from "@kevinap29/sveltekit-lib/helpers";

try {
  const decoded = verifyToken<{ userId: number }>(token, "my-secret");
  console.log(decoded.userId);
} catch (err) {
  console.error("Invalid token");
}
```

---

### 2. Hooks (`@kevinap29/sveltekit-lib/hooks`)

#### `protectedHandle`

A SvelteKit `handle` hook that protects routes by requiring a valid JWT.

**Usage in **``**:**

```ts
import { protectedHandle } from "@kevinap29/sveltekit-lib/hooks";

export const handle = protectedHandle({
  secret: "my-secret",
  publicRoutes: ["/login", "/register"]
});
```

**Options:**

- `secret` – Secret key used for token verification.
- `publicRoutes` – Array of paths that don’t require authentication.

---

### 3. Types (`@kevinap29/sveltekit-lib/types`)

#### `JwtPayload`

Represents the structure of a decoded JWT.

```ts
import type { JwtPayload } from "@kevinap29/sveltekit-lib/types";

const payload: JwtPayload = {
  userId: 123,
  iat: 1610000000,
  exp: 1610003600
};
```

#### `HookOptions`

Configuration options for `protectedHandle`.

```ts
import type { HookOptions } from "@kevinap29/sveltekit-lib/types";

const options: HookOptions = {
  secret: "my-secret",
  publicRoutes: ["/auth/login"]
};
```

---

## 📝 Example Project Setup

**hooks.server.ts**

```ts
import { protectedHandle } from "@kevinap29/sveltekit-lib/hooks";

export const handle = protectedHandle({
  secret: process.env.JWT_SECRET!,
  publicRoutes: ["/auth/login", "/auth/register"]
});
```

**login.ts (API route)**

```ts
import { signToken } from "@kevinap29/sveltekit-lib/helpers";

export const POST = async ({ request }) => {
  const { username, password } = await request.json();
  // validate user...
  const token = signToken({ username }, process.env.JWT_SECRET!, { expiresIn: "1h" });
  return new Response(JSON.stringify({ token }), { status: 200 });
};
```

**protected-route.ts**

```ts
import type { JwtPayload } from "@kevinap29/sveltekit-lib/types";

export const GET = async ({ locals }) => {
  const user = locals.user as JwtPayload;
  return new Response(`Hello ${user.username}`);
};
```

---

## 📖 License

MIT © @kevinap29
