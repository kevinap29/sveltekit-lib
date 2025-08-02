import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { JWTHelper } from '$lib/index.js';

export const GET = (async () => {
    const token = await JWTHelper.generate('test', { email: 'admin@example.com', role: 'admin' })
    const verify = await JWTHelper.verify(token, 'test')
    
    return json({ status: 'OK' }, { status: 200 })
}) satisfies RequestHandler;

export const POST = (async ({ url }) => {
    throw redirect(301, url.origin + '/api/error?status=502&message=Method not implement');
}) satisfies RequestHandler;

export const PUT = (async ({ url }) => {
    throw redirect(301, url.origin + '/api/error?status=502&message=Method not implement');
}) satisfies RequestHandler;

export const DELETE = (async ({ url }) => {
    throw redirect(301, url.origin + '/api/error?status=502&message=Method not implement');
}) satisfies RequestHandler;