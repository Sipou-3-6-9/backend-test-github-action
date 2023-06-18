


const userAuthenticationType = `#graphql
    type Mutation {
        # Noted : user register is in createStaffInfo multation, when create staff automatic they have email and password for login 
        loginUser(emailAddress: String!, password: String!): LoginUserResponse
        generateOTP(emailAddress: String!): ResponseMessages
        verifyOTP(otp: String!): ResponseMessages,
        resetPassword(emailAddress: String!, password: String!): ResponseMessages
        updateUser(input: StaffInfoInput, _id:ID): ResponseMessages
    }
    type OTP {
        _id: ID
        otp: String
        createdAt: Date
        updatedAt: Date
    }
    type LoginUserResponse{
      success: Boolean
      message: String
      token: String
      user: StaffInfo
    }
    
`
export default userAuthenticationType;