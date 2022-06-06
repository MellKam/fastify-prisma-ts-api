import { preHandlerHookHandler } from 'fastify/types/hooks';
import { UnauthorizedError } from '../../utils/http-errors.js';

const authGuard: preHandlerHookHandler = (req, _reply, done) => {
	if (req.auth === null) {
		done(new UnauthorizedError('You are not authorized'));
	}
	done();
};

export default authGuard;
