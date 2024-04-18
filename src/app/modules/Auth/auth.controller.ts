import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import config from "../../config";



const loginUser = catchAsync(async (req, res) => {
    const result = await AuthServices.loginUser(req.body)
    const { accessToken, refreshToken, needsPasswordChange } = result
    res.cookie("refreshToken", refreshToken, {
        secure: config.NODE_ENV === "production",
        httpOnly: true
    })
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User logged in succesfully',
        data: {
            accessToken, needsPasswordChange
        },
    });
})
const changePassword = catchAsync(async (req, res) => {
    const user = req?.user
    const result = await AuthServices.changePassword(user, req.body)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Password change succesfully',
        data: result,
    });
})
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies
    const result = await AuthServices.refreshToken(refreshToken)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Access token is retrieved succesfully',
        data: result,
    });
})
const forgetPassword = catchAsync(async (req, res) => {
    const userId = req.body.id
    const result = await AuthServices.forgetPassword(userId)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reset link generated succesfully',
        data: result,
    });
})
const resetPassword = catchAsync(async (req, res) => {
    const token = req.headers.authorization as string
    const result = await AuthServices.resetPassword(req?.body, token)
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reset password succesfully',
        data: result,
    });
})

export const AuthControllers = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword
}