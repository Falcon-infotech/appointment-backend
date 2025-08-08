import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesByBranch
} from '../controllers/courseController.js';
import { authenticate } from '../middlewares/auth.js';

const courseRouter = express.Router();
courseRouter.use(authenticate);

courseRouter.post('/create', createCourse);
courseRouter.get('/all', getAllCourses);
courseRouter.get('/:id', getCourseById);
courseRouter.get('/by/:branchId', getCoursesByBranch);
courseRouter.put('/:id', updateCourse);
courseRouter.delete('/:id', deleteCourse);

export default courseRouter;
