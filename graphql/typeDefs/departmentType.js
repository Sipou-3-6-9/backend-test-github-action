

const departmentType = `#graphql
    type Query {
      getDepartmentById(_id: ID): Department
      getDepartmentsPagination(page:Int, limit:Int, keyword:String, pagination:Boolean): DepartmentPaginator
    }
    type Mutation {
      createDepartment(input: DepartmentInput): ResponseMessages
      updateDepartment(input: DepartmentInput, _id:ID): ResponseMessages
      deleteDepartment(_id:ID): ResponseMessages
    }
    type Department{
      _id:ID
      departmentName:String
      remark:String
      # teamAssigned:[Character]
      createdAt: Date
      updatedAt: Date
    }
    # type Character{
    #   positions: Positions
    #   isManager: Boolean

    # }
    type DepartmentPaginator {
        data:[Department]
        paginator:Paginator
    }
    input DepartmentInput{
      departmentName:String
      remark:String
      # teamAssigned:[CharacterInput]
    }
    # input CharacterInput{
    #   positions: ID
    #   isManager: Boolean
    # }

 

`;

export default departmentType