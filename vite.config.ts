import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import { getEnvFileName } from './src/utils/environment.js';

dotenv.config({ path: getEnvFileName() });

export default defineConfig({
	test: {
		include: ['./src/**/*.{unit,integration}.test.ts'],
	},
});
