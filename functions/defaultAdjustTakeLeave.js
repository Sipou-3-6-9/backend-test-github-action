import TakeLave from '../models/takeLeave.js'
import StaffInfo from '../models/staffInfo.js'
import OvertimeWork from '../models/overtimeWork.js'
import mongoose from 'mongoose';

const defaultAdjustTakeLeave = async (staffId, takeLeaveType)=>{

    try {

        var defaultTakeLeaveQuantity;
        var validUntilDate;

        let date = new Date()
        const lastDayOfAug = new Date(date.getFullYear(), 8, 0).getDate()
        // console.log(lastDay, 'lastDay')
        if(date.getMonth()+1 < 9){
            validUntilDate = new Date(`${date.getFullYear()}-08-${lastDayOfAug}T16:59:59.999Z`)
        }else if(date.getMonth()+1 >= 9){
            validUntilDate = new Date(`${date.getFullYear()+1}-08-${lastDayOfAug}T16:59:59.999Z`)
        }
        // console.log(validUntilDate, "validUntilDate")
    
        if(takeLeaveType === 'Annual Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 18,
                totalUsed: 0,
                totalRemaining: 18
            }
        }else if(takeLeaveType === 'Sick Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 8,
                totalUsed: 0,
                totalRemaining: 8
            }
        }else if(takeLeaveType === 'Maternity Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 92,
                totalUsed: 0,
                totalRemaining: 92
            }
    
        }else if(takeLeaveType === 'Paternity Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 7,
                totalUsed: 0,
                totalRemaining: 7
            }
        }else if(takeLeaveType === 'Breastfeeding'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 366,
                totalUsed: 0,
                totalRemaining: 336
            }
        }
        else if(takeLeaveType === 'Compassionate(wedding) Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 7,
                totalUsed: 0,
                totalRemaining: 7
            }
        }else if(takeLeaveType === 'Compassionate(death) Leave'){
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 3,
                totalUsed: 0,
                totalRemaining: 3
            }
        }
        else if(takeLeaveType === 'Alternative Leave'){
            const findTotalOt = await OvertimeWork.aggregate([
                {$match: {createdBy: mongoose.Types.ObjectId(staffId)}},
                {$group:{
                    _id: null,
                    totalOvertime: {$sum: '$totalOvertimeAsDay'}
                }}
            ])
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: findTotalOt.length>0 ? findTotalOt[0].totalOvertime : 0,
                totalUsed: 0,
                totalRemaining: findTotalOt.length>0 ? findTotalOt[0].totalOvertime : 0
            }
        }
        // else if(takeLeaveType === 'Unpaid Leave'){
        
        // }
        
        const createDefault = await TakeLave({
            isAdjust: true,
            takeLeaveType: takeLeaveType,
            createdBy: staffId,
            paymentOfTakeLeaveQuantity: defaultTakeLeaveQuantity
        }).save()
    
        // return {
    
        // }
    } catch (error) {
        console.log(error.message)
    }
    
}

export default defaultAdjustTakeLeave