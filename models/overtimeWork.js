import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const overTimeSchema = mongoose.Schema({
    timeType: {type: String, enum:['hours', 'days']},
    totalOvertimeAsDay: Number,
    totalOvertimeAsHours: Number,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date,
    reason: String,
    status: {type: String, enum: ['Pending', 'Approved', 'Denied']},
    createdBy: {type: mongoose.Types.ObjectId, ref: 'StaffInfo'},
    requestTo: {type: mongoose.Types.ObjectId, ref: 'StaffInfo'},
    approvedOrDeniedBy: {type: mongoose.Types.ObjectId, ref:'StaffInfo'},
    approvedOrDeniedDate: Date,
    reply: [
        {
            // character: {type: mongoose.Type.ObjectId, ref:'StaffInfo'},
            characterType: {type: String, enum: ['approver', 'requesters']},
            text: String,
        }
    ],
    managerReply: String
}, { timestamps: true });

overTimeSchema.plugin(paginate)
const OvertimeWork = mongoose.model("OvertimeWork", overTimeSchema);

export default OvertimeWork;

