import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { bookBatch, deleteBatch, getAllBatches, getAvailableInstructors, getBatchesByInstructor, getMyAllBatches, updateBatch } from '../controllers/batchController.js';


const batchRouter = express.Router();
batchRouter.use(authenticate);

batchRouter.post('/available_instructors', getAvailableInstructors);
batchRouter.post('/bookBatch', bookBatch);
batchRouter.get('/all', getAllBatches);
// batchRouter.get("/my_batches", getMyAllBatches);
batchRouter.get('/:instructorId', getBatchesByInstructor);
batchRouter.put('/:id', updateBatch);
batchRouter.delete('/:id', deleteBatch);


export default batchRouter;