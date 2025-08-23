import { describe, it, expect } from 'vitest';
import { JWTHelper } from '$lib/helpers/jwt-helper.js';

const SECRET = 'test-secret';
const PAYLOAD = { userId: 42 } as any; // Use 'any' to bypass type for test
const EXPIRES_IN = '1h';

describe('JWTHelper', () => {
    it('should generate a valid JWT token', async () => {
        const token = await JWTHelper.generate(SECRET, PAYLOAD, EXPIRES_IN);
        expect(typeof token).toBe('string');
        expect(token.split('.').length).toBe(3); // JWT format
    });

    it('should throw error if secret is empty', async () => {
        await expect(JWTHelper.generate('', PAYLOAD)).rejects.toThrow('Token must not be empty');
    });

    it('should verify a valid JWT token and return payload', async () => {
        const token = await JWTHelper.generate(SECRET, PAYLOAD, EXPIRES_IN);
        const payload = await JWTHelper.verify(token, SECRET);
        expect(payload.userId).toBe(PAYLOAD.userId);
    });

    it('should throw error for invalid token', async () => {
        const invalidToken = 'invalid.token.value';
        await expect(JWTHelper.verify(invalidToken, SECRET)).rejects.toThrow();
    });

    it('should throw error for wrong secret', async () => {
        const token = await JWTHelper.generate(SECRET, PAYLOAD, EXPIRES_IN);
        await expect(JWTHelper.verify(token, 'wrong-secret')).rejects.toThrow();
    });

    it('should generate token without expiration if not provided', async () => {
        const token = await JWTHelper.generate(SECRET, PAYLOAD);
        expect(typeof token).toBe('string');
        const payload = await JWTHelper.verify(token, SECRET);
        expect(payload.userId).toBe(PAYLOAD.userId);
    });
});