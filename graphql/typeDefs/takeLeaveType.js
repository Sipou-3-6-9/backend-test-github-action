

const takeLeaveType = `#graphql
    type Query {
        getTakeLeaveById(_id: ID!): TakeLave
        getTakeLeaveWithPagination(page:Int, limit:Int, keyword:String, pagination: Boolean userId: String, status: [String], adjust: Boolean): TakeLeavePagination
        getPaymentOfTakeLeaveQty(staffId:ID!, takeLeaveType:String!): PaymentOfTakeLeaveQuantity
        getTakeLeaveTypeByUserId(userId: ID!): [String]
    }, 
    type Mutation {
        createTakeLeave(input: TakeLeaveInput): ResponseMessages
        updateTakeLeave(input: TakeLeaveInput, _id: ID!): ResponseMessages
        deleteTakeLeave(timeOffId:ID): ResponseMessages
        approveTakeLeave(takeLeaveId: ID!, userId: ID!, managerReply: String): ResponseMessages
        denyTakeLeave(takeLeaveId: ID!, userId: ID!, managerReply: String): ResponseMessages
    }
    # type Subscription{
    #     requestTimeOff:TimeOff!
    # }
    type TakeLave{
        _id:ID
        isAdjust: Boolean
        totalLeaveAsDay: Float
        startDate: Date
        endDate: Date
        returnDate: Date
        reason: String
        status: String
        takeLeaveType: String
        createdBy: StaffInfo
        requestTo: StaffInfo
        approvedOrDeniedBy: StaffInfo
        approvedOrDeniedDate: Date
        paymentOfTakeLeaveQuantity: PaymentOfTakeLeaveQuantity
        managerReply: String
        createdAt: Date
        updatedAt: Date
    }
    type PaymentOfTakeLeaveQuantity{
        validUntil: Date
        totalForAYear: Float
        totalUsed: Float
        totalRemaining: Float
    }
    input TakeLeaveInput{
        isAdjust: Boolean
        totalLeaveAsDay: Float
        startDate: Date
        endDate: Date
        returnDate: Date
        reason: String
        status: String
        takeLeaveType: String
        createdBy: ID
        requestTo: ID
        approvedOrDeniedBy: ID
        # approvedDate: Date
        paymentOfTakeLeaveQuantity: PaymentOfTakeLeaveQuantityInput
        managerReply: String
    }
    input PaymentOfTakeLeaveQuantityInput{
        validUntil: Date
        totalForAYear: Float
        totalUsed: Float
        totalRemaining: Float
    }
    type TakeLeavePagination{
        data: [TakeLave]
        paginator: Paginator
    }
`;
export default takeLeaveType;