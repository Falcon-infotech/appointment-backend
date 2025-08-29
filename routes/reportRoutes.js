import express from 'express';
import { getSingleInstructorAllBatches, getInstructorBatches, getInstructorReport } from '../controllers/reportController.js';
import { authenticate } from '../middlewares/auth.js';

const reportRouter = express.Router();
reportRouter.use(authenticate);

reportRouter.post("/instructor_report", getInstructorReport);
reportRouter.post("/instructor_batches/:instructorId", getInstructorBatches);
// reportRouter.get("/single_instructor_batches/:instructorId", getSingleInstructorAllBatches);


export default reportRouter;