


const covidVaccinationType = `#graphql
    type Query {
        getStaffCovidVaccinationById(_id: ID): CovidVaccination
        getStaffCovidVaccinationPagination(page:Int, limit:Int, keyword:String, pagination: Boolean): CovidVaccinationPagination
        getCovidVacinByStaffId(staffId: ID!): [CovidVaccination]
    }
    type Mutation {
        createStaffCovidVaccination(input: CovidVaccinationInput, staffInfoId: ID): ResponseMessages
        updateStaffCovidVaccination(input: CovidVaccinationInput, _id:ID): ResponseMessages
        deleteStaffCovidVaccination(_id:ID): ResponseMessages
    }
    type CovidVaccination {
        _id: ID
        dosesNumber: String
        vaccinName: String
        vaccinationLocation: String
        vaccinationDate: String
    }
    input CovidVaccinationInput {
        dosesNumber: String
        vaccinName: String
        vaccinationLocation: String
        vaccinationDate: String
    }
    type CovidVaccinationPagination {
        data: [CovidVaccination]
        paginator: Paginator
    }
   
`
export default covidVaccinationType;
