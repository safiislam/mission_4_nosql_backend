import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { SemesterRegistrationValidations } from "./semesterRegistration.validation";
import { SemesterRegistrationControllers } from "./semesterRegistration.controller";



const router = Router()

router.post('/create-semester-registration', validateRequest(SemesterRegistrationValidations.createSemesterRegistrationValidationSchema), SemesterRegistrationControllers.createSemesterRegistration)
router.get('/', SemesterRegistrationControllers.getAllSemesterRegistration)
router.get('/:id', SemesterRegistrationControllers.getSingleSemesterRestration)
router.patch('/:id', validateRequest(SemesterRegistrationValidations.updateSemesterRegistrationValidationSchema), SemesterRegistrationControllers.updateSemesterRegistration)



export const SemesterRegistrationRoutes = router

