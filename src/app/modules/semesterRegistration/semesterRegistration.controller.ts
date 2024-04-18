import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SemesterRegistrationServices } from "./semesterRegistration.service";

const createSemesterRegistration = catchAsync(async (req, res) => {
    const result = await SemesterRegistrationServices.createSemesterRegistrationIntoDB(req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Semester created succesfully',
        data: result,
    });
})
const getSingleSemesterRestration = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await SemesterRegistrationServices.getSingleSemesterRestrationFromBD(id)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get Semester retrieved succesfully',
        data: result,
    });
})
const getAllSemesterRegistration = catchAsync(async (req, res) => {
    const result = await SemesterRegistrationServices.getAllSemesterRegistrationFromDB(req.query)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Get Semester retrieved succesfully',
        data: result,
    });
})
const updateSemesterRegistration = catchAsync(async (req, res) => {
    const { id } = req.params
    const result = await SemesterRegistrationServices.updateSemesterRegistrationFromDB(id, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Update Semester retrieved succesfully',
        data: result,
    });
})

export const SemesterRegistrationControllers = {
    createSemesterRegistration,
    getSingleSemesterRestration,
    getAllSemesterRegistration,
    updateSemesterRegistration
} 