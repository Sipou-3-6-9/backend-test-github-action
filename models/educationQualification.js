import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const educationSchema = mongoose.Schema({
    staffInfoId: {type: mongoose.Types.ObjectId, ref:'StaffInfo'},
    level:{
        type: String,
        enum: ['High School','Bachelor Degree','Master Degree','Doctor Philosophy']
    },
    major:{
        type: mongoose.Types.ObjectId,
        ref: 'Major'
    },
    universityName: String,
    graduactionDate: String,
    remark: String
},{ timestamps: true })
educationSchema.plugin(paginate)
const EducationQualification = mongoose.model("EducationQualification", educationSchema);

export default EducationQualification;