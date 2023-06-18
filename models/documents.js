import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const documentSchema = mongoose.Schema({
    documentName: String,
    documentURL: String,
    staffInfoId: {type: mongoose.Types.ObjectId, ref:'StaffInfo'}
}, { timestamps: true });
documentSchema.plugin(paginate)
const Documents = mongoose.model("Documents", documentSchema);

export default Documents;