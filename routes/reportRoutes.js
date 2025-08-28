import express from 'express';
import { getAllBatchesByInstructor, getInstructorBatches, getInstructorReport } from '../controllers/reportController.js';

const reportRouter = express.Router();


reportRouter.post("/instructor_report", getInstructorReport);
reportRouter.post("/instructor_batches/:instructorId", getInstructorBatches);
reportRouter.post("/single_instructor_batches/:instructorId", getAllBatchesByInstructor);


export default reportRouter;