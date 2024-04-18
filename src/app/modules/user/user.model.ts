import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { TUser, UserModel } from './user.interface';
const userSchema = new Schema<TUser, UserModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0
    },
    passwordChangeAt: {
      type: Date
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExist = async function (id) {
  return await User.findOne({ id }).select('+password')
}
userSchema.statics.isDeletedExist = async function (payload) {
  return await payload.isDeleted
}
userSchema.statics.isStatusBlockedExist = async function (payload) {
  return await payload.status === "blocked"
}

userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword)
}
userSchema.statics.isJWTIssuedBeforeBeforePasswordChanged = async function (passwordChangeTimestamp, jwtIssuedTimestamps) {
  const passwordChangeTime = new Date(passwordChangeTimestamp).getTime() / 1000
  return passwordChangeTime > jwtIssuedTimestamps
}

export const User = model<TUser, UserModel>('User', userSchema);
