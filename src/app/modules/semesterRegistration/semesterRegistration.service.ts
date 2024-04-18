import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { AcademicSemester } from "../academicSemester/academicSemester.model";
import { TSemesterRegistration } from "./semesterRegistration.interface";
import { SemesterRegistration } from "./semesterRegistration.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { RegistrationStatus } from "./semesterRegistration.constant";


const createSemesterRegistrationIntoDB = async (payload: TSemesterRegistration) => {
    const academicSemester = payload?.academicSemester
    const isThereAnyUpcomingOrOngoingSemester = await SemesterRegistration.findOne({
        $or: [
            { status: RegistrationStatus.ONGOING },
            {
                status: RegistrationStatus.UPCOMING
            }
        ]
    })
    if (isThereAnyUpcomingOrOngoingSemester) {
        throw new AppError(httpStatus.BAD_REQUEST,
            `There is aready an ${isThereAnyUpcomingOrOngoingSemester.status} registered semester !`)
    }
    const isExistsInAcademicSemester = await AcademicSemester.findById(academicSemester)
    if (!isExistsInAcademicSemester) {
        throw new AppError(httpStatus.NOT_FOUND, "This academic semester is not Found!")
    }
    const isExistsInSemesterRegistration = await SemesterRegistration.findOne({ academicSemester })
    if (isExistsInSemesterRegistration) {
        throw new AppError(httpStatus.NOT_FOUND, "This academic semester already exists")
    }
    const result = await SemesterRegistration.create(payload)
    return result
}
const getSingleSemesterRestrationFromBD = async (id: string) => {
    const result = await SemesterRegistration.findById(id)
    return result
}

const getAllSemesterRegistrationFromDB = async (query: Record<string, unknown>) => {
    const semesterRegistrationQuery = new QueryBuilder(SemesterRegistration.find().populate('academicSemester'), query)
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = await semesterRegistrationQuery.modelQuery

    return result
}

const updateSemesterRegistrationFromDB = async (id: string, payload: Partial<TSemesterRegistration>) => {
    const isSemesterRegistrationExists = await SemesterRegistration.findById(id)
    if (!isSemesterRegistrationExists) {
        throw new AppError(httpStatus.NOT_FOUND, 'The semester is not found')
    }

    const currentSemesterStatus = isSemesterRegistrationExists?.status
    const requestedStatus = payload?.status
    if (currentSemesterStatus === RegistrationStatus.ENDED) {
        throw new AppError(httpStatus.NOT_FOUND, `This semester is already ${currentSemesterStatus}`)
    }

    if (currentSemesterStatus === RegistrationStatus.UPCOMING && requestedStatus === RegistrationStatus.ENDED) {
        throw new AppError(httpStatus.NOT_FOUND, `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}
    }`)
    }
    if (currentSemesterStatus === RegistrationStatus.ONGOING && requestedStatus === RegistrationStatus.UPCOMING) {
        throw new AppError(httpStatus.NOT_FOUND, `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}
    }`)
    }

    const result = await SemesterRegistration.findByIdAndUpdate(id, payload, { new: true, runValidators: true })
    return result
}


export const SemesterRegistrationServices = {
    createSemesterRegistrationIntoDB,
    getSingleSemesterRestrationFromBD,
    getAllSemesterRegistrationFromDB,
    updateSemesterRegistrationFromDB
}