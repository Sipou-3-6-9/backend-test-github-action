import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const birthdaySchema = mongoose.Schema({
    staffId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "StaffInfo"
    },
    dob: Date,
    day: Number,
    month: Number,
    rounds: [{type:Number}]
}, { timestamps: true });
birthdaySchema.plugin(paginate)
const birthdayReminder = mongoose.model("BirthdayReminder", birthdaySchema);

export default birthdayReminder;