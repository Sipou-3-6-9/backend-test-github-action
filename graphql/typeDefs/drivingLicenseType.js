

const drivingLicenseType = `#graphql
    type Query {
        getStaffDrivingLicenseById(_id: ID): DrivingLicense
        getStaffDrivingLicensePagination(page:Int, limit:Int, keyword:String, pagination: Boolean): DrivingLicensePagination
        getDrivingLincenseByStaffId(staffId: ID!): [DrivingLicense]
    }
    type Mutation {
        createStaffDrivingLicense(staffInfoId:ID, input: DrivingLicenseInput): ResponseMessages
        updateStaffDrivingLicense(input: DrivingLicenseInput, _id: ID): ResponseMessages
        deleteStaffDrivingLicense(_id: ID): ResponseMessages
    }
    type DrivingLicense{
        _id: ID
        drivingId: String
        manualOrAuto: String
        expiryDate: Date
        issueDate: Date
        drivingType: String
        remark: String
    }
    input DrivingLicenseInput{
        drivingId: String
        manualOrAuto: String
        expiryDate: Date
        issueDate: Date
        drivingType: String
        remark: String
    }
    type ResponseDrivingLicense{
        success: Boolean
        message: String
    }

    type DrivingLicensePagination{
        data: [DrivingLicense]
        paginator: Paginator
    }
`
export default drivingLicenseType;