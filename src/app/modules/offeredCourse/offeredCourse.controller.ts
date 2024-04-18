import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { OfferedCourseServices } from "./offeredCourse.service";


const createOfferedCourse = catchAsync(async (req, res) => {
    const data = req.body
    const result = await OfferedCourseServices.createOfferedCourseIntoDB(data)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered course created succesfully',
        data: result,
    });
})
const updateOfferedCourse = catchAsync(async (req, res) => {
    const { id } = req.params
    const data = req.body
    const result = await OfferedCourseServices.updateOfferedCourseFromDB(id, data)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Offered course update succesfully',
        data: result,
    });
})
export const OfferedCourseControllers = {
    createOfferedCourse,
    updateOfferedCourse
}