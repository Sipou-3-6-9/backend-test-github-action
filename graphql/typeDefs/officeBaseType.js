

const officeBaseType = `#graphql
    type Query {
        getOfficeBaseById(_id: ID): OfficeBase
        getOfficeBasesPagination(page:Int, limit:Int, keyword:String, pagination:Boolean): OfficeBasePagination
    }
    type Mutation {
        createOfficeBase(input: OfficeBaseInput): ResponseMessages
        updateOfficeBase(input: OfficeBaseInput, _id:ID): ResponseMessages
        deleteOfficeBase(_id:ID): ResponseMessages
    }
    type OfficeBase{
        _id:ID
        officeBaseName:String
        remark:String
        createdAt: Date
        updatedAt: Date
    }
    input OfficeBaseInput{
        officeBaseName:String
        remark:String
    }
    type OfficeBasePagination{
        data:[OfficeBase]
        paginator:Paginator
    }
`
export default officeBaseType;