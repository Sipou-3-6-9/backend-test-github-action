
import StaffInfo from '../models/staffInfo.js'
import Positions from '../models/positions.js'
import Contract from '../models/contract.js'



export const geAllAdminEmail = async()=>{

    const getAllAdmin = await StaffInfo.find({$and:[
        {'systemAccessData.role': 'Admin'},
        {'systemAccessData.active': true}
    ]})
    const getAllAdminEmail = getAllAdmin.map(e=> e.systemAccessData.emailAddress)
   
  
    // console.log(getAllAdminEmail, "getAllEmail");
    return getAllAdminEmail
    
}

export const getRequestTo = async(requesterId)=>{
    const getStaffRequester = await StaffInfo.findById(requesterId).populate(
        {
            path: 'currentContract',
            populate: [{path: 'positions'}]
        },
    )

    if(!getStaffRequester.currentContract){
        return "contract not found!"
    }
    const managerPositionsId = getStaffRequester.currentContract.positions.managerPositions

    const getManagerContract = await Contract.find({$and:[
        {isActive: true},
        {positions: managerPositionsId}
        // {staffInfoId: managerPositionsId}
    ]})

    const contractId = getManagerContract.map(e => e._id)
  
    const getStaffManagerId = await StaffInfo.findOne({$and: [
        {currentContract: {$in: contractId}},
        {currentSituation: {$eq: 'Working'}}
    ]})
   
    const staffManagerId = getStaffManagerId ? getStaffManagerId._id : null

    return staffManagerId
}




