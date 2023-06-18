import bookType from "./typeDefs/bookType.js"
import GlobalType from "./typeDefs/GlobalType.js"
import workingPlaceType from "./typeDefs/workingPlaceType.js"
import workingBaseType from "./typeDefs/workingBaseType.js"
import officeBaseType from "./typeDefs/officeBaseType.js"
import positionsType from "./typeDefs/positionsType.js"
import departmentType from "./typeDefs/departmentType.js"
import majorType from "./typeDefs/majorType.js"
import drivingLicenseType from './typeDefs/drivingLicenseType.js'
import educationQualificationType from "./typeDefs/educationQualificationType.js"
import covidVaccinationType from "./typeDefs/covidVaccinationType.js"
import contractType from "./typeDefs/contractType.js"
import staffInfoType from "./typeDefs/staffInfoType.js"
import overtimeWorkType from "./typeDefs/overtimeWorkType.js"
import userAuthenticationType from "./typeDefs/userAuthentication.js"
import takeLeaveType from "./typeDefs/takeLeaveType.js"
import dashboardType from "./typeDefs/dashboard.js"
import actionLogsType from "./typeDefs/actionLogsType.js"
import reportType from './typeDefs/reportType.js'
import documentType from './typeDefs/documentType.js'

const typeDefs = [
    GlobalType,
    bookType,
    workingPlaceType,
    workingBaseType,
    officeBaseType,
    positionsType,
    departmentType,
    majorType,
    drivingLicenseType,
    educationQualificationType,
    covidVaccinationType,
    contractType,
    staffInfoType,
    overtimeWorkType,
    userAuthenticationType,
    takeLeaveType,
    dashboardType,
    actionLogsType,
    reportType,
    documentType,
]

export default typeDefs