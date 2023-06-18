import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const covidVaccinationSchema = mongoose.Schema({
    staffInfoId: {type: mongoose.Types.ObjectId, ref:'StaffInfo'},
    dosesNumber: String,
    vaccinName: {
        type: String,
        enum:["Sinovac", "Sinopharm", "AstraZeneca", "Pizer/BioNTech", "Janssen", "Moderna", "Novavax", "Bhara Biotech"]
    },
    vaccinationLocation: String,
    vaccinationDate:String
}, { timestamps: true });
covidVaccinationSchema.plugin(paginate)
const CovidVaccination = mongoose.model("CovidVaccination", covidVaccinationSchema);

export default CovidVaccination;