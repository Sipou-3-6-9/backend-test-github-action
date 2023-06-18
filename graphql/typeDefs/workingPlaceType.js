

const workingPlaceType = `#graphql
    type Query {
        getWorkingPlaceById(_id: ID): WorkingPlace
        getWorkingPlacePagination(page: Int, limit: Int, keyword: String, pagination:Boolean): WorkingPlacePagination
    }
    type Mutation {
        createWorkingPlace(input: WorkingPlaceInput): ResponseMessages
        updateWorkingPlace(input: WorkingPlaceInput, _id:ID): ResponseMessages
        deleteWorkingPlace(_id:ID): ResponseMessages
    }
    type WorkingPlace{
        _id:ID
        workingPlaceName:String
        remark:String
        createdAt: Date
        updatedAt: Date
    }
    input WorkingPlaceInput{
        workingPlaceName:String
        remark:String
    }
    type WorkingPlacePagination{
        data:[WorkingPlace]
        paginator:Paginator
    }

`
export default workingPlaceType;