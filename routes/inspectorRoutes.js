import express from 'express';
import {
  createInspector,
  getAllInspectors,
  getInspectorById,
  updateInspector,
  deleteInspector
} from '../controllers/inspectorController.js';
import { authenticate } from '../middlewares/auth.js';

const inspectorRouter = express.Router();
inspectorRouter.use(authenticate);

inspectorRouter.post('/create', createInspector);
inspectorRouter.get('/all', getAllInspectors);
inspectorRouter.get('/:id', getInspectorById);
inspectorRouter.put('/:id', updateInspector);
inspectorRouter.delete('/:id', deleteInspector);

export default inspectorRouter;
