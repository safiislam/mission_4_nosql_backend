import { Schema, model } from "mongoose";
import { TSemesterRegistration } from "./semesterRegistration.interface";
import { semesterRegistrationStatus } from "./semesterRegistration.constant";



const createSemesterRegistrationSchema = new Schema<TSemesterRegistration>({
    academicSemester: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'AcademicSemester',
        unique: true
    },
    status: {
        type: String,
        enum: semesterRegistrationStatus,
        default: 'UPCOMING'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    maxCredit: {
        type: Number,
        default: 3
    },
    minCredit: {
        type: Number,
        default: 15
    }
}, {
    timestamps: true
})


export const SemesterRegistration = model<TSemesterRegistration>("SemesterRegistration", createSemesterRegistrationSchema)