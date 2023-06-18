import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const drivingLicenseSchema = mongoose.Schema({
    staffInfoId: {type: mongoose.Types.ObjectId, ref:'StaffInfo'},
    drivingId: String,
    manualOrAuto: {type: String, enum: ['Manual', 'Auto']},
    issueDate: {type: Date},
    expiryDate: {type: Date},
    drivingType: {
        type: String,
        enum: ['A', 'B']
    },
    remark: String,
}, { timestamps: true });
drivingLicenseSchema.plugin(paginate)
const DrivingLicense = mongoose.model("DrivingLicense", drivingLicenseSchema);

export default DrivingLicense;