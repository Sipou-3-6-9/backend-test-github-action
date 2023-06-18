

const overtimeWorkType = `#graphql
   
    type Query {
        getOvertimeWorkById(_id: ID): OvertimeWork
        getOvertimeWorkPagination(page:Int, limit:Int, keyword:String, pagination:Boolean, userId: ID, status: [String]): OvertimeWorkPagination
    }, 
    type Mutation {
        createOvertimeWork(input: OvertimeWorkInput): ResponseMessages
        updateOvertimeWork(input: OvertimeWorkInput, _id:ID): ResponseMessages
        deleteOvertimeWork(_id:ID): ResponseMessages
        approveOvertime(overtimeId: ID!, userId: ID!, managerReply: String): ResponseMessages
        denyOvertime(overtimeId: ID!, userId: ID!, managerReply: String): ResponseMessages
    }
    # type Subscription{
    #     requestTimeOff:TimeOff!
    # }
    type OvertimeWork{
        _id:ID
        timeType: String
        totalOvertimeAsDay: Float,
        totalOvertimeAsHours: Float,
        startDate: Date
        endDate: Date
        startTime: Date
        endTime: Date
        reason: String
        status: String
        createdBy: StaffInfo
        requestTo: StaffInfo
        approvedOrDeniedBy: StaffInfo
        reply: Reply
        managerReply: String
        updatedAt: Date
        createdAt: Date
    }
    type Reply{
        # character: StaffInfo
        characterType: String
        text: String,
    }
    input OvertimeWorkInput{
        timeType: String
        totalOvertimeAsDay: Float,
        totalOvertimeAsHours: Float,
        startDate: Date
        endDate: Date
        startTime: Date
        endTime: Date
        reason: String
        status: String
        createdBy: ID
        requestTo: ID
        approvedOrDeniedBy: ID
        reply: ReplyInput
        managerReply: String
    }
    input ReplyInput{
        # character: StaffInfo
        characterType: String
        text: String
    }
   
    type OvertimeWorkPagination{
        data:[OvertimeWork]
        paginator:Paginator
    }
`;
export default overtimeWorkType;