import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const workingBaseSchema = mongoose.Schema({
    workingBaseName: String,
    remark: String,
}, { timestamps: true });
workingBaseSchema.plugin(paginate)
const WorkingBase = mongoose.model("WorkingBase", workingBaseSchema);

export default WorkingBase;