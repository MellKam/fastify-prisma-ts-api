import { vi } from 'vitest';
import { GoogleAuthService as GoogleAuthServiceType } from '../google-auth.service.js';

export const GoogleAuthService = vi.fn(
	(): Partial<GoogleAuthServiceType> => ({
		verifyUserCode: vi.fn(),
		getGoogleAuthUrl: vi.fn(),
	}),
);
