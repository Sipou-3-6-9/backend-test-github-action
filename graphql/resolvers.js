import bookResolvers from "./resolvers/bookResolver.js"
import workingPlaceResolver from "./resolvers/workingPlaceResolver.js"
import workingBaseResolver from "./resolvers/workingBaseResolver.js"
import officeBaseResolver from "./resolvers/officeBaseResolver.js"
import positionsResolver from "./resolvers/positionsResolver.js"
import departmentResolver from "./resolvers/departmentResolver.js"
import majorResolver from "./resolvers/majorResolver.js"
import educationResolver from "./resolvers/educationQualificationResolver.js"
import drivingLicenseResolver from "./resolvers/drivingLicenseResolver.js"
import covidVaccinationResolver from "./resolvers/covidVaccinationResolver.js"
import contractResolver from "./resolvers/contractResolver.js"
import staffInfoResolver from "./resolvers/staffInfoResolver.js"
import overtimeWorkResolver from "./resolvers/overtimeWorkResolver.js"
import userAuthenticationResolver from "./resolvers/userAuthenticationResolver.js"
import takeLeaveResolver from "./resolvers/takeLeaveResolver.js"
import dashboardResolvers from "./resolvers/dashboard.js"
import actionLogsResolvers from "./resolvers/actionLogsResolver.js"
import reportType from './resolvers/reportsResolver.js'
import documentResolver from './resolvers/documentResolver.js'

const resolvers = {
    Query: {
        ...bookResolvers.Query,
        ...workingPlaceResolver.Query,
        ...workingBaseResolver.Query,
        ...officeBaseResolver.Query,
        ...positionsResolver.Query,
        ...departmentResolver.Query,
        ...majorResolver.Query,
        ...educationResolver.Query,
        ...drivingLicenseResolver.Query,
        ...covidVaccinationResolver.Query,
        ...contractResolver.Query,
        ...staffInfoResolver.Query,
        ...overtimeWorkResolver.Query,
        ...takeLeaveResolver.Query,
        ...dashboardResolvers.Query,
        ...actionLogsResolvers.Query,
        ...reportType.Query,
        ...documentResolver.Query,
    },
    Mutation: {
        ...workingPlaceResolver.Mutation,
        ...workingBaseResolver.Mutation,
        ...officeBaseResolver.Mutation,
        ...positionsResolver.Mutation,
        ...departmentResolver.Mutation,
        ...majorResolver.Mutation,
        ...educationResolver.Mutation,
        ...drivingLicenseResolver.Mutation,
        ...covidVaccinationResolver.Mutation,
        ...contractResolver.Mutation,
        ...staffInfoResolver.Mutation,
        ...overtimeWorkResolver.Mutation,
        ...userAuthenticationResolver.Mutation,
        ...takeLeaveResolver.Mutation,
        ...documentResolver.Mutation,
    }
}

export default resolvers