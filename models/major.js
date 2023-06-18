import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const majorSchema = mongoose.Schema({
    majorName: String,
    remark: String,
}, { timestamps: true });
majorSchema.plugin(paginate)
const Major = mongoose.model("Major", majorSchema);

export default Major;