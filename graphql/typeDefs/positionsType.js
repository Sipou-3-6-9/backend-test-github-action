
const positionsType = `#graphql
  
    type Query {
        getPositionsById(_id: ID): Positions
        getPositionsWithPagination(page:Int, limit:Int, keyword:String, pagination:Boolean, departmentId: String): PositionsPaginator
        getPositionsByDepartmentId(departmentId: ID!):[Positions]
    }
    type Mutation {
        createPositions(input: PositionsInput): ResponseMessages
        updatePositions(input: PositionsInput, positionsId:ID): ResponseMessages
        deletePositions(positionsId:ID): ResponseMessages
    }
    type Positions{
        _id:ID
        positionName:String
        positionNameKhmer: String
        inDepartment: Department,
        isDepartmentManager: Boolean,
        managerPositions: Positions
        remark:String
    }
    # type InDepartment{
    #     departmentId: Department,
    #     isDepartmentManager: Boolean,
    # }
    input PositionsInput{
        positionName:String
        positionNameKhmer: String
        inDepartment: ID,
        isDepartmentManager: Boolean,
        managerPositions: ID
        remark:String
    }
    # input InDepartmentInput{
    #     departmentId: ID,
    #     isDepartmentManager: Boolean,
    # }
    type PositionsPaginator {
        data:[Positions]
        paginator:Paginator
    }
`

export default positionsType;