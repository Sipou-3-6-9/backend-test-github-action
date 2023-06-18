import mongoose from 'mongoose'


const oneTimePasswordSchema = mongoose.Schema({
    otp: {type: String, require: true},
    expireAt: {type: Date, require: true}
}, { timestamps: true });

const OneTimePassword = mongoose.model("OneTimePassword", oneTimePasswordSchema);

export default OneTimePassword;