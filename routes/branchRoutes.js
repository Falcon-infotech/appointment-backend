import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch } from '../controllers/branchController.js';

const branchRouter = express.Router();
branchRouter.use(authenticate);

branchRouter.post('/create', createBranch);
branchRouter.get('/all', getAllBranches);
branchRouter.get('/:id', getBranchById);
branchRouter.put('/:id', updateBranch);
branchRouter.delete('/:id', deleteBranch);

export default branchRouter;
