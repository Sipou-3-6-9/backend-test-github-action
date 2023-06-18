import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const officeBaseSchema = mongoose.Schema({
    officeBaseName: String,
    remark: String,
}, { timestamps: true });
officeBaseSchema.plugin(paginate)
const OfficeBase = mongoose.model("OfficeBase", officeBaseSchema);

export default OfficeBase;