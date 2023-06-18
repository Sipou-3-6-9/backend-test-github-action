import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const actionLogsSchema = mongoose.Schema({
    user: {type: mongoose.Types.ObjectId, ref: 'StaffInfo'},
    actionOn: {type: String},
    actionType: String,
    docId: String
}, { timestamps: true });
actionLogsSchema.plugin(paginate)
const ActionLogs = mongoose.model("ActionLogs", actionLogsSchema);

export default ActionLogs;