import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { bookBatch, getAvailableInspectors } from '../controllers/batchController.js';


const batchRouter = express.Router();
batchRouter.use(authenticate);

batchRouter.post('/available_inspectors', getAvailableInspectors);
batchRouter.post('/bookBatch', bookBatch);


export default batchRouter;