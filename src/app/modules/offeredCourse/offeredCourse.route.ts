import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { OfferedCourseValidations } from "./offeredCourse.validation";
import { OfferedCourseControllers } from "./offeredCourse.controller";



const router = Router()

router.post('/create-offered-course', validateRequest(OfferedCourseValidations.createOfferedCourseValidationSchema), OfferedCourseControllers.createOfferedCourse)
router.patch("/:id", validateRequest(OfferedCourseValidations.updateOfferedCourseValidationSchema), OfferedCourseControllers.updateOfferedCourse)
export const OfferedCourseRoutes = router 