import { Router } from 'express';
import authenticate from '../../middlewares/authenticate';

import { getSummaryByCallId, createSummary, deleteSummary } from './summary.controller';

const summaryRoutes = Router();

summaryRoutes.get('/:callId', authenticate, getSummaryByCallId);
summaryRoutes.post('/create', authenticate, createSummary);
summaryRoutes.delete('/delete/:callId', authenticate, deleteSummary);

export default summaryRoutes;
