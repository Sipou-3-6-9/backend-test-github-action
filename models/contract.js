import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const contractSchema = mongoose.Schema({
    // contractType: {type: String},
    isActive: {type: Boolean, default: false}, 
    startDate: {type: Date},
    endDate: {type: Date},
    typeOfEmployment: {type: String, enum: ['Full Time', 'Part Time', 'Probation', 'Volunteer', 'Internship']},
    staffInfoId: {type: mongoose.Types.ObjectId, ref: 'StaffInfo'},
    // department: {type: mongoose.Types.ObjectId, ref: 'Department'},
    positions: {type: mongoose.Types.ObjectId, ref: 'Positions'},
    officeBase: {type: mongoose.Types.ObjectId, ref: 'OfficeBase'},
    workingBase: {type: mongoose.Types.ObjectId, ref: 'WorkingBase'},
    workingPlace: {type: mongoose.Types.ObjectId, ref: 'WorkingPlace'},
    fileUpload: {
        fileName: String,
        fileSrc: String
    },
    remark: String
    
}, { timestamps: true });
contractSchema.plugin(paginate)
const Contract = mongoose.model("Contract", contractSchema);

export default Contract;