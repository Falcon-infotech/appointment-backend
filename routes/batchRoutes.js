import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { bookBatch, getAllBatches, getAvailableInspectors, getBatchesByInspector } from '../controllers/batchController.js';


const batchRouter = express.Router();
batchRouter.use(authenticate);

batchRouter.post('/available_inspectors', getAvailableInspectors);
batchRouter.post('/bookBatch', bookBatch);
batchRouter.get('/all', getAllBatches);
batchRouter.get('/:inspectorId', getBatchesByInspector);


export default batchRouter;