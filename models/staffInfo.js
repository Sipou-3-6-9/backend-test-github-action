import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const staffInfoSchema = mongoose.Schema({
    staffId: {type: String},
    systemAccessData: {
        emailAddress: String,
        password: String,
        // accessPermissions: { type: mongoose.Types.ObjectId, ref: 'Permissions' }
        role: {type: String, enum: ['Admin', 'User']},
        isActive: Boolean
    },
    startedDate: {type: Date},
    currentSituation: {type: String, enum: ['Working', 'Stop']},
    currentContract: { type: mongoose.Types.ObjectId, ref: 'Contract' },
    staffProfile: {
        imageName: String,
        imageSrc: String,
        englishData: {
            firstNameLatin: String,
            lastNameLatin: String,
            gender: {type: String, enum: ['Male', 'Female']},
            identityCardEng: String,
            passportsNumerEng: String,
            phoneNumberEng: String,
            nationalityEng: String,
            dateOfBirthEng: Date,
            maritalStatusEng: { type: String, enum: ['Married', 'Single'] },
            placeOfBirthEng: {
                villageEng: String,
                communeEng: String,
                districtEng: String,
                cityEng: String,
            },
            permananceAddressEng: {
                villageEng: String,
                communeEng: String,
                districtEng: String,
                cityEng: String,
            },
            temporaryAddressEng: {
                villageEng: String,
                communeEng: String,
                districtEng: String,
                cityEng: String,
            }
        },
        
        khmerData: {
            firstNameKh: String,
            lastNameKh: String,
            placeOfBirthKh: {
                villageKh: String,
                communeKh: String,
                districtKh: String,
                cityKh: String,
            },
            permananceAddressKh: {
                villageKh: String,
                communeKh: String,
                districtKh: String,
                cityKh: String,
            },
            temporaryAddressKh: {
                villageKh: String,
                communeKh: String,
                districtKh: String,
                cityKh: String,
            }
        }
    },
    otherInfo: {
        educationBackground: [{ type: mongoose.Types.ObjectId, ref: 'EducationQualification' }],
        drivingLicense: [{ type: mongoose.Types.ObjectId, ref: 'DrivingLicense' }],
        covidVaccination: [{ type: mongoose.Types.ObjectId, ref: 'CovidVaccination' }],
    },
}, { timestamps: true });
staffInfoSchema.plugin(paginate)
const StaffInfo = mongoose.model("StaffInfo", staffInfoSchema);

export default StaffInfo;