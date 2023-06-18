

const majorType = `#graphql
    type Query {
        getMajorById(_id: ID): Major
        getMajorWithPagination(page:Int, limit:Int, keyword:String, pagination:Boolean): MajorPagination
    }
    type Mutation {
        createMajor(input: MajorInput): ResponseMessages
        updateMajor(input: MajorInput, _id:ID): ResponseMessages
        deleteMajor(_id:ID): ResponseMessages
    }

    type Major{
        _id:ID
        majorName:String
        remark:String
        createdAt: Date
        updatedAt: Date
    }
    input MajorInput{
        majorName:String
        remark:String
    }
    type MajorPagination{
        data:[Major]
        paginator:Paginator
    }
`
    export default majorType;