


const contractType = `#graphql
    type Query {
        getContractById(_id: ID): Contract
        getContractPagination(page:Int, limit:Int, keyword:String, pagination: Boolean): ContractPagination
        getContractByStaffId(staffId: ID!): [Contract]
    }
    type Mutation {
        createContract(staffInfoId: ID!, input: ContractInput): ResponseMessages
        updateContract(input: ContractInput, _id:ID): ResponseMessages
        deleteContract(_id:ID): ResponseMessages
        editContractStatus(_id: String!, isActive: Boolean!): ResponseMessages
    }
    type Contract {
        _id: ID
        # contractType: String,
        isActive: Boolean,
        startDate: Date,
        endDate: Date,
        typeOfEmployment: String
        # staffInfoId: StaffInfo,
        # department: Department,
        positions: Positions,
        officeBase: OfficeBase,
        workingBase: WorkingBase,
        workingPlace: WorkingPlace,
        # fileUpload: FileUpload
        remark: String
    }
    type FileUpload {
        fileName: String,
        fileSrc: String
    }
    input ContractInput {
        # contractType: String,
        isActive: Boolean,
        startDate: Date,
        endDate: Date,
        typeOfEmployment: String
        # staffInfoId: ID,
        # department: ID,
        positions: ID,
        officeBase: ID,
        workingBase: ID,
        workingPlace: ID,
        # fileUpload: FileUploadInput
        remark: String
    }
    input FileUploadInput {
        fileName: String,
        fileSrc: String
    }
    type ContractPagination {
        data: [Contract]
        paginator: Paginator
    }
   
`
export default contractType;
