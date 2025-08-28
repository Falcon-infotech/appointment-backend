import express from 'express';

import { authenticate } from '../middlewares/auth.js';
import { createInstructor, deleteInstructor, getAllInstructors, getInstructorById, updateInstructor } from '../controllers/instructorController.js';

const instructorRouter = express.Router();
instructorRouter.use(authenticate);

instructorRouter.post('/create', createInstructor);
instructorRouter.get('/all', getAllInstructors);
instructorRouter.get('/:id', getInstructorById);
instructorRouter.put('/:id', updateInstructor);
instructorRouter.delete('/:id', deleteInstructor);

export default instructorRouter;
