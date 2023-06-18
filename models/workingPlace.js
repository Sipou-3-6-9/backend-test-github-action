import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const workingPlaceSchema = mongoose.Schema({
    workingPlaceName: String,
    remark: String,
}, { timestamps: true });
workingPlaceSchema.plugin(paginate)
const WorkingPlace = mongoose.model("WorkingPlace", workingPlaceSchema);

export default WorkingPlace;