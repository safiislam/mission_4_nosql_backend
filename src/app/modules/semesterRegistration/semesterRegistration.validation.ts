import { z } from 'zod';
import { semesterRegistrationStatus } from './semesterRegistration.constant';

const createSemesterRegistrationValidationSchema = z.object({
    body: z.object({
        academicSemester: z.string(),
        status: z.enum([...semesterRegistrationStatus] as [string, ...string[]]).optional().default("UPCOMING"),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        minCredit: z.number().min(3),
        maxCredit: z.number().max(15),

    })
})
const updateSemesterRegistrationValidationSchema = z.object({
    body: z.object({
        academicSemester: z.string().optional(),
        status: z.enum([...semesterRegistrationStatus] as [string, ...string[]]).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        minCredit: z.number().min(3).optional(),
        maxCredit: z.number().max(15).optional(),

    })
})

export const SemesterRegistrationValidations = {
    createSemesterRegistrationValidationSchema,
    updateSemesterRegistrationValidationSchema
}