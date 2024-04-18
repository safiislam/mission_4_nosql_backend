/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import { OfferedCourse } from "../offeredCourse/offeredCourse.model"
import { TEnrolledCourse } from "./enrolledCourse.interface"
import { EnrolledCourse } from "./enrolledCourse.model"
import { Student } from "../student/student.model"
import mongoose from "mongoose"
import { SemesterRegistration } from "../semesterRegistration/semesterRegistration.model"
import { Course } from "../Course/course.model"
import { Faculty } from "../Faculty/faculty.model"
import calculateGradeAndPoints from "./enrolledCourse.utils"

const createEnrolledCourseIntoDB = async (userId: string, payload: Partial<TEnrolledCourse>) => {
    const { offeredCourse } = payload
    const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse)

    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Offered Course is not found")
    }
    const student = await Student.findOne({ id: userId }).select('_id')
    if (!student) {
        throw new AppError(httpStatus.NOT_FOUND, "Studnet is not exists")
    }
    if (isOfferedCourseExists.maxCapacity <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Room is full !")
    }
    const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
        semesterRegistration: isOfferedCourseExists.semesterRegistration,
        offeredCourse,
        student: student?.id
    })
    if (isStudentAlreadyEnrolled) {
        throw new AppError(httpStatus.CONFLICT, "Studnet already enrolled")
    }
    const { semesterRegistration, academicSemester, academicFaculty, course, faculty, academicDepartment } = isOfferedCourseExists
    const courseData = await Course.findById(course)
    const semesterRegistrationData = await SemesterRegistration.findById(semesterRegistration)
    const enrolledCourses = await EnrolledCourse.aggregate([
        {
            $match: {
                semesterRegistration: semesterRegistration,
                student: student._id
            }
        },
        {
            $lookup: {
                from: 'courses',
                localField: 'course',
                foreignField: '_id',
                as: "enrolledCourseData"
            }
        }, {
            $unwind: "$enrolledCourseData"
        },
        {
            $group: { _id: null, totalEnrolledCredits: { $sum: "$enrolledCourseData.credits" } }
        }, {
            $project: {
                _id: 0,
                totalEnrolledCredits: 1
            }
        }
    ])
    const totalCredits = enrolledCourses.length > 0 ? enrolledCourses[0].totalEnrolledCredits : 0
    if (totalCredits && semesterRegistrationData?.maxCredit && totalCredits + courseData?.credits > semesterRegistrationData?.maxCredit) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have exceeded maximum number of credits")
    }
    const session = await mongoose.startSession();
    try {
        session.startTransaction()
        const result = await EnrolledCourse.create([{
            semesterRegistration,
            academicSemester,
            academicFaculty,
            academicDepartment,
            offeredCourse,
            isEnrolled: true,
            course,
            student: student._id,
            faculty,

        }], { session })
        if (!result) {
            throw new AppError(httpStatus.BAD_REQUEST, "Failed to enroll in this course")
        }
        const maxCapacity = isOfferedCourseExists.maxCapacity
        await OfferedCourse.findByIdAndUpdate(offeredCourse, {
            maxCapacity: maxCapacity - 1
        }, { session })
        await session.commitTransaction()
        await session.endSession()
        return result
    } catch (error: any) {
        await session.abortTransaction()
        await session.endSession()
        throw new Error(error)
    }
}

const updateEnrolledCourseMarksIntoDB = async (facultyId: string, payload: Partial<TEnrolledCourse>) => {
    console.log(facultyId);
    const { semesterRegistration, student, offeredCourse, courseMarks } = payload
    const isSemesterRegistrationExists = await SemesterRegistration.findById(semesterRegistration)
    if (!isSemesterRegistrationExists) {
        throw new AppError(httpStatus.NOT_FOUND, "SemesterRegistration is not found")
    }
    const isStudentExists = await Student.findById(student)
    if (!isStudentExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Student is not found")
    }
    const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse)
    if (!isOfferedCourseExists) {
        throw new AppError(httpStatus.NOT_FOUND, "OfferedCourse is not found")
    }
    const faculty = await Faculty.findOne({ id: facultyId }, { _id: 1 })
    if (!faculty) {
        throw new AppError(httpStatus.FORBIDDEN, "Faculty is not available")
    }
    const isCourseBlongsToFaculty = await EnrolledCourse.findOne({
        semesterRegistration,
        student,
        offeredCourse,
        faculty: faculty._id
    })
    if (!isCourseBlongsToFaculty) {
        throw new AppError(httpStatus.NOT_FOUND, "Enroll course is not exists for this faculty")
    }
    const modifiedMarks: Record<string, unknown> = {
        ...courseMarks
    }
    if (courseMarks?.finalTerm) {
        const { classTest1, classTest2, midTerm, finalTerm } = isCourseBlongsToFaculty.courseMarks
        const totalmarks = Math.ceil(classTest1 * 0.1) + Math.ceil(midTerm * 0.3) + Math.ceil(classTest2 * 0.1) + Math.ceil(finalTerm * 0.5)
        const result = calculateGradeAndPoints(totalmarks);
        modifiedMarks.grade = result.grade
        modifiedMarks.gredePoints = result.gradePoints
        modifiedMarks.isCompleted = true
    }

    if (courseMarks && Object.keys(courseMarks).length) {
        for (const [key, value] of Object.entries(courseMarks)) {
            modifiedMarks[`courseMarks.${key}`] = value
        }
    }
    const result = await EnrolledCourse.findByIdAndUpdate(isCourseBlongsToFaculty._id, modifiedMarks, { new: true })
    return result
}
export const EnrolledCourseServices = {
    createEnrolledCourseIntoDB,
    updateEnrolledCourseMarksIntoDB
}