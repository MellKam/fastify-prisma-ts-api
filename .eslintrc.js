module.exports = {
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	root: true,
	env: { node: true },
	ignorePatterns: ['.eslintrc.js', 'prisma'],
	rules: {
		'prettier/prettier': 'warn',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
				destructuredArrayIgnorePattern: '^_',
				args: 'all',
				vars: 'all',
			},
		],
		'no-console': ['warn', { allow: ['warn', 'error'] }],
		'@typescript-eslint/no-var-requires': 'error',
		'prefer-const': [
			'error',
			{
				destructuring: 'all',
				ignoreReadBeforeAssign: false,
			},
		],
		'no-var': 'error',
		'@typescript-eslint/no-explicit-any': 'off',
		'object-curly-spacing': ['warn', 'always'],
	},
};
