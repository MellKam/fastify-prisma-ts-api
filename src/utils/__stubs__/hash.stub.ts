import crypto from 'crypto';

export const getRandomHash = () => {
	return crypto.randomBytes(16).toString('hex');
};
