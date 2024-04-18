/* eslint-disable no-unused-vars */
import { Model } from "mongoose";
import { USER_ROLE } from "./user.constant";

export interface TUser {
  id: string;
  password: string;
  email: string,
  passwordChangeAt?: Date,
  needsPasswordChange: boolean;
  role: 'admin' | 'student' | 'faculty';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
};

export interface UserModel extends Model<TUser> {
  isUserExist(id: string): Promise<TUser | null>
  // isDeletedExist(payload: TUser): Promise<boolean | null>
  // isStatusBlockedExist(payload: TUser): Promise<boolean | null>
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>
  isJWTIssuedBeforeBeforePasswordChanged(passwordChangeTimestamp: Date, jwtIssuedTimestamp: number): Promise<boolean | null>
}

export type TUserRole = keyof typeof USER_ROLE