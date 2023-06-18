import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const departmentSchema = mongoose.Schema(
  {
    departmentName: String,
    remark: String,
    // teamAssigned: [
    //   {
    //     positions: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Positions",
    //     },
    //     isManager: { type: Boolean, require: true},
    //   },
    // ],
  },
  { timestamps: true }
);
departmentSchema.plugin(paginate);
const Department = mongoose.model("Department", departmentSchema);

export default Department;
