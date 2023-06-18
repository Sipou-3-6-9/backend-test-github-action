
import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const takeLeaveSchema = mongoose.Schema({
    isAdjust: Boolean,
    totalLeaveAsDay: Number,
    startDate: Date,
    endDate: Date,
    returnDate: Date,
    reason: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Denied']
    },
    takeLeaveType: {
        type: String,
        enum: [
            'Annual Leave', 
            'Sick Leave', 
            'Alternative Leave',
            'Maternity Leave', 
            'Paternity Leave',
            'Breastfeeding', 
            'Compassionate(wedding) Leave',
            'Compassionate(death) Leave',
            'Unpaid Leave',
        ]
    },
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "StaffInfo"},
    requestTo: {type: mongoose.Schema.Types.ObjectId, ref: "StaffInfo"},
    approvedOrDeniedBy: {type: mongoose.Schema.Types.ObjectId,ref: "StaffInfo"},
    approvedOrDeniedDate: {type: Date, default: null},
    paymentOfTakeLeaveQuantity: {
        validUntil: {type: Date, require: true},
        totalForAYear: {type: Number, require: true},
        // lastYearRemaining: {type: Number, default: 0},
        totalUsed: {type: Number, require: true},
        totalRemaining: {type: Number, require: true},
    },
    managerReply: String
}, { timestamps: true });

takeLeaveSchema.plugin(paginate)
const TakeLeave = mongoose.model("TakeLeave", takeLeaveSchema);

export default TakeLeave;

