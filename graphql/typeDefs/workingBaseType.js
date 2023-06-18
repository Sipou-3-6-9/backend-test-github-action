

const workingBaseType = `#graphql
    type Query {
        getWorkingBaseById(_id: ID): WorkingBase
        getWorkingBasePagination(page: Int, limit: Int, keyword: String, pagination:Boolean): WorkingBasePagination
    }
    type Mutation {
        createWorkingBase(input: WorkingBaseInput): ResponseMessages
        updateWorkingBase(input: WorkingBaseInput, _id:ID): ResponseMessages
        deleteWorkingBase(_id:ID): ResponseMessages
    }
    type WorkingBase{
        _id: ID
        workingBaseName: String
        remark: String
        createdAt: Date
        updatedAt: Date
    }
    input WorkingBaseInput{
        workingBaseName:String
        remark:String
    }
    type WorkingBasePagination{
        data:[WorkingBase]
        paginator:Paginator
    }


`
export default workingBaseType;