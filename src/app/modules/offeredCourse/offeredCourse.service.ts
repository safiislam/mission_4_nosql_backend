import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { SemesterRegistration } from "../semesterRegistration/semesterRegistration.model";
import { TOfferedCourse } from "./offeredCourse.interface";
import { OfferedCourse } from "./offeredCourse.model";
import { AcademicFaculty } from "../academicFaculty/academicFaculty.model";
import { AcademicDepartment } from "../academicDepartment/academicDepartment.model";
import { Course } from "../Course/course.model";
import { Faculty } from "../Faculty/faculty.model";
import { hasTimeConflict } from "./offeredCourse.utils";



const createOfferedCourseIntoDB = async (payload: TOfferedCourse) => {
    const { semesterRegistration, academicFaculty, academicDepartment, course, faculty, days, startTime, endTime, section } = payload

    const isSemesterRegistrationExist = await SemesterRegistration.findById(semesterRegistration)
    if (!isSemesterRegistrationExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Semester registration not found")
    }
    const academicSemester = isSemesterRegistrationExist.academicSemester
    const isAcademicFacultyExists = await AcademicFaculty.findById(academicFaculty)
    if (!isAcademicFacultyExists) {
        throw new AppError(httpStatus.NOT_FOUND, "Semester registration not found")
    }
    const isAcademicDepartment = await AcademicDepartment.findById(academicDepartment)
    if (!isAcademicDepartment) {
        throw new AppError(httpStatus.NOT_FOUND, "Academic department not found")
    }
    const isCourseExist = await Course.findById(course)
    if (!isCourseExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Course is not found")
    }
    const isFacultyExist = await Faculty.findById(faculty)
    if (!isFacultyExist) {
        throw new AppError(httpStatus.NOT_FOUND, "Faculty is not found")
    }
    //  check if the depertment is belong to the faculty
    const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({ academicFaculty, _id: academicDepartment })
    if (!isDepartmentBelongToFaculty) {
        throw new AppError(httpStatus.NOT_FOUND, `This ${isAcademicDepartment.name} is not belongs to ${isAcademicFacultyExists.name}`)
    }
    // check if the same course same section in same registered semester exist
    const someValidataion = await OfferedCourse.findOne({
        semesterRegistration,
        course,
        section
    })
    if (someValidataion) {
        throw new AppError(httpStatus.BAD_REQUEST, "Offered course is already existsss")
    }
    const assignedSchedules = await OfferedCourse.find({
        semesterRegistration,
        faculty
    }).select('days startTime endTime')
    const newSchedule = {
        days,
        startTime,
        endTime
    }
    if (hasTimeConflict(assignedSchedules, newSchedule)) {
        throw new AppError(httpStatus.CONFLICT, "This faculty is not available at that time ! choose other time or day")
    }


    const result = await OfferedCourse.create({ ...payload, academicSemester })
    return result
}

const updateOfferedCourseFromDB = async (id: string, payload: Pick<TOfferedCourse, "days" | "faculty" | "startTime" | "endTime">) => {
    return null
}



export const OfferedCourseServices = {
    createOfferedCourseIntoDB,
    updateOfferedCourseFromDB
}