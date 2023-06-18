import TakeLave from '../models/takeLeave.js'
import StaffInfo from '../models/staffInfo.js'
import OvertimeWork from '../models/overtimeWork.js'
import mongoose from 'mongoose';
import { request, gql, GraphQLClient } from 'graphql-request';

const generateDefaultQtyAllTakeLeaveType = async (staffId, header)=>{

    try {
    //Get take leave type by user "getTakeLeaveTypeByUserId" 
    const endpoint = "https://pepy-hrms-backend.vercel.app/" //Production endpoint
    //let endpoint = "http://localhost:6001/" //Development endpoint
    let graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          authorization: header.token,
        },
    })
    const query = gql`
      query Query($userId: ID!) {
          getTakeLeaveTypeByUserId(userId: $userId)
      }
    `;
    const variables = {
        "userId": staffId
    }
    const getTakeLeaveType = await graphQLClient.request(query, variables)

    //Loop take leave type by user and Call "getPaymentOfTakeLeaveQty"
    getTakeLeaveType.getTakeLeaveTypeByUserId.map(async element => {
        const query = gql`
            query GetPaymentOfTakeLeaveQty($staffId: ID!, $takeLeaveType: String!) {
                getPaymentOfTakeLeaveQty(staffId: $staffId, takeLeaveType: $takeLeaveType) {
                    validUntil
                    totalForAYear
                    totalUsed
                    totalRemaining
                }
            }
        `;
        const variables = {
            "staffId": staffId,
            "takeLeaveType": element
        }
        const eachPaymentOfTakeLeaveQty = await graphQLClient.request(query, variables)
   
    })
   
    
    } catch (error) {
        console.log(error.message)
    }
    
}

export default generateDefaultQtyAllTakeLeaveType