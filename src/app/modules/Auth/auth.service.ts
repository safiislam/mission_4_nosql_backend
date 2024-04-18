import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import { TLoginUser } from "./auth.interface";
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../../config";
import bcrypt from 'bcrypt';
import { createToken, htmlTemplaet, verifyJwt } from "./auth.utils";
import { sendEmail } from "../../utils/sendEmail";

const loginUser = async (payload: TLoginUser) => {
    // {
    //     const isUserExist = await User.findOne({ id: payload?.id })

    //     if (!isUserExist) {
    //         throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    //     }
    //     const isDeleted = isUserExist?.isDeleted
    //     if (isDeleted) {
    //         throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    //     }
    //     const userStatus = isUserExist?.status
    //     if (userStatus === 'blocked') {
    //         throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    //     }
    //     const isPasswordMatched = await bcrypt.compare(payload?.password, isUserExist?.password)
    // }

    const user = await User.isUserExist(payload?.id)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    }
    const isDeleted = user?.isDeleted
    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    }
    const userStatus = user?.status
    if (userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    }
    const isPasswordMatched = await User.isPasswordMatched(payload?.password, user?.password)
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, "Password do not matched")
    }

    const jwtPayload = {
        userId: user?.id,
        role: user?.role
    }
    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expires_in as string)
    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expires_in as string)

    return {
        accessToken,
        refreshToken,
        needsPasswordChange: user?.needsPasswordChange
    }

}
const changePassword = async (userData: JwtPayload, payload: { oldPassword: string, newPassword: string }) => {
    const user = await User.isUserExist(userData?.userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    }
    const isDeleted = user?.isDeleted
    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    }
    const userStatus = user?.status
    if (userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    }
    const isPasswordMatched = await User.isPasswordMatched(payload?.oldPassword, user?.password)
    if (!isPasswordMatched) {
        throw new AppError(httpStatus.FORBIDDEN, "Password do not matched")
    }


    const newHashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds))

    await User.findOneAndUpdate({
        id: userData?.userId,
        role: userData?.role

    }, {
        password: newHashedPassword,
        needPasswordChange: false,
        passwordChangeAt: new Date()
    })
    return null
}
const refreshToken = async (token: string) => {

    const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;
    const { userId } = decoded.data
    const { iat } = decoded
    const user = await User.isUserExist(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    }
    const isDeleted = user?.isDeleted
    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    }
    const userStatus = user?.status
    if (userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    }
    if (user?.passwordChangeAt && await User?.isJWTIssuedBeforeBeforePasswordChanged(user?.passwordChangeAt, iat as number)) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized ')
    }
    const jwtPayload = {
        userId: user?.id,
        role: user?.role
    }
    const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expires_in as string)
    return {
        accessToken
    }
}

const forgetPassword = async (userId: string) => {
    const user = await User.isUserExist(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    }
    const isDeleted = user?.isDeleted
    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    }
    const userStatus = user?.status
    if (userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    }
    const jwtPayload = {
        userId: user?.id,
        role: user?.role
    }
    const resetToken = createToken(jwtPayload, config.jwt_access_secret as string, "10m")
    const resetUiLink = `${config.reset_pass_ui_link}?id=${user?.id}&token=${resetToken}`
    // console.log(resetUiLink);

    sendEmail(user?.email, htmlTemplaet(resetUiLink))
}
const resetPassword = async (payload: { id: string, newPassword: string }, token: string) => {
    const decoded = verifyJwt(token, config.jwt_access_secret as string)
    const { userId, role } = decoded.data
    const user = await User.isUserExist(userId)
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "This user is not exist")
    }
    const isDeleted = user?.isDeleted
    if (isDeleted) {
        throw new AppError(httpStatus.FORBIDDEN, "This user is deleted")
    }
    const userStatus = user?.status
    if (userStatus === 'blocked') {
        throw new AppError(httpStatus.FORBIDDEN, "This user is blocked")
    }
    if (userId !== payload.id) {
        throw new AppError(httpStatus.FORBIDDEN, "Id do not matched")
    }
    const newHashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds))

    await User.findOneAndUpdate({
        id: userId,
        role: role

    }, {
        password: newHashedPassword,
        needPasswordChange: false,
        passwordChangeAt: new Date()
    })

}

export const AuthServices = {
    loginUser,
    changePassword,
    refreshToken,
    forgetPassword,
    resetPassword
}