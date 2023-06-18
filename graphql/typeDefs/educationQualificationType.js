

const educationQualificationType = `#graphql
    type Query {
        getEducationQualificationById(_id: ID): Education 
        getEducationQualificationPagination(page:Int, limit:Int, keyword:String, pagination: Boolean): EducationPagination
        getEducationByStaffId(staffId:ID!): [Education]
    }
    type Mutation {
        createStaffEducation(input: EducationInput, staffInfoId: ID): ResponseMessages
        updateStaffEducation(input: EducationInput, _id: ID): ResponseMessages
        deleteStaffEducation(_id: ID): ResponseMessages
    }
    type Education{
        _id: ID
        level: String
        major: Major
        universityName: String
        graduactionDate: Date
        remark: String
    }
    input EducationInput{
        level: String
        major: ID
        universityName: String
        graduactionDate: Date
        remark: String
    }
    type EducationPagination{
        data: [Education]
        paginator: Paginator
    }
`
export default educationQualificationType;