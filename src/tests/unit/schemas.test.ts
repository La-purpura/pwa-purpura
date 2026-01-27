import { describe, it, expect } from 'vitest';
import { UserInviteSchema, UserCreateSchema, TaskSchema } from '@/lib/schemas';

describe('Schemas Validation', () => {
    describe('UserCreateSchema', () => {
        it('should validate correct user creation data', () => {
            const data = {
                email: 'newuser@example.com',
                name: 'New User',
                role: 'Militante',
                password: 'password123'
            };
            const result = UserCreateSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail on invalid email', () => {
            const data = {
                email: 'invalid-email',
                name: 'User',
                role: 'Militante'
            };
            const result = UserCreateSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });

    describe('TaskSchema', () => {
        it('should validate valid task', () => {
            const data = {
                title: 'Fix Bug',
                priority: 'high',
                status: 'pending'
            };
            const result = TaskSchema.safeParse(data);
            expect(result.success).toBe(true);
        });

        it('should fail on short title', () => {
            const data = {
                title: 'Hi',
                priority: 'low'
            };
            const result = TaskSchema.safeParse(data);
            expect(result.success).toBe(false);
        });
    });
});
