import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { bookBatch, deleteBatch, getAllBatches, getAvailableInspectors, getBatchesByInspector, updateBatch } from '../controllers/batchController.js';


const batchRouter = express.Router();
batchRouter.use(authenticate);

batchRouter.post('/available_inspectors', getAvailableInspectors);
batchRouter.post('/bookBatch', bookBatch);
batchRouter.get('/all', getAllBatches);
batchRouter.get('/:inspectorId', getBatchesByInspector);
batchRouter.put('/:id', updateBatch);
batchRouter.delete('/:id', deleteBatch);


export default batchRouter;