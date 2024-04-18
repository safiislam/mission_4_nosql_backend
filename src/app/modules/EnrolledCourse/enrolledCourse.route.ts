import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { EnrolledCourseValidations } from "./enrolledCourse.validation";
import { EnrolledCourseControllers } from "./enrolledCourse.controller";
import auth from "../../middlewares/auth";

const router = Router()

router.post('/create-enrolled-course', auth("student"), validateRequest(EnrolledCourseValidations.enrolledCourseValidationSchema), EnrolledCourseControllers.createEnrolledCourse)
router.patch('/', auth("faculty"), validateRequest(EnrolledCourseValidations.updateEnrolledCourseMarksValidationSchema), EnrolledCourseControllers.updateEnrolledCourseMarks)



export const EnrolledCourseRoutes = router