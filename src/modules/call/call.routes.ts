import { Router } from 'express';
import authenticate from '../../middlewares/authenticate';
import * as callController from './call.controller';

const callRoutes = Router();

callRoutes.get('/:id', authenticate, callController.getCall);
callRoutes.get('/user/all', authenticate, callController.getUserCalls);
callRoutes.get('/user/contact/:contactId', authenticate, callController.getUserContactCallsWithCallerFlag);
callRoutes.get('/user/caller', authenticate, callController.getCallsByCaller);
callRoutes.get('/', callController.getAllCalls);

callRoutes.delete('/:id', authenticate, callController.deleteCall);

export default callRoutes;
