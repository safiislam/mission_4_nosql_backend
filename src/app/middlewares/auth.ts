import { NextFunction, Request, Response } from "express"
import catchAsync from "../utils/catchAsync"
import AppError from "../errors/AppError"
import httpStatus from "http-status"
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { TUserRole } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";

const auth = (...requiredRoles: TUserRole[]) => {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const token = req.headers.authorization
        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized')
        }

        const decoded = jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;
        const { role, userId } = decoded.data
        const { iat } = decoded
        console.log(iat);
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


        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized last')
        }
        req.user = decoded.data
        next()
    })
}

export default auth