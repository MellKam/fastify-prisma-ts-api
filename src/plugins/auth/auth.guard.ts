import { preHandlerHookHandler } from 'fastify/types/hooks';
import { ForbiddentError } from '../../utils/http-errors.js';

const authGuard: preHandlerHookHandler = (req, _reply, done) => {
	if (req.auth === null) {
		done(new ForbiddentError());
	}
	done();
};

export default authGuard;
