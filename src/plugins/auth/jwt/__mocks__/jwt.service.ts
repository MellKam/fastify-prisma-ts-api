import { vi } from 'vitest';
import type { JwtService as JwtServiceType } from '../../../../plugins/auth/jwt/jwt.service.js';

export const JwtService = vi.fn(
	(): Partial<JwtServiceType> => ({
		decodeToken: vi.fn(),
		generateKeyPair: vi.fn(),
	}),
);
