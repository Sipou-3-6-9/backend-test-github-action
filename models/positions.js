import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const positionsSchema = mongoose.Schema({
       positionName: String,
       positionNameKhmer: String,
       inDepartment: { type: mongoose.Types.ObjectId, ref: 'Department'},
       isDepartmentManager: Boolean,
       managerPositions: { type: mongoose.Types.ObjectId, ref: 'Positions', default: null},
       requirements: [String],
       responsibility: [String],
       remark: String,          
}, { timestamps: true });

positionsSchema.plugin(paginate)
const Positions = mongoose.model("Positions", positionsSchema);

export default Positions;

