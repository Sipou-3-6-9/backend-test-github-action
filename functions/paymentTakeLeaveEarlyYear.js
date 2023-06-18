import TakeLave from '../models/takeLeave.js'
import StaffInfo from '../models/staffInfo.js'
import OvertimeWork from '../models/overtimeWork.js'
import mongoose from 'mongoose';

const paymentTakeLeaveEarlyYear = async (staffId, takeLeaveType)=>{

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
        
        const getLastTakeLeaveQty = await TakeLave.findOne({$and:[
            {createdBy: {$eq: staffId}},
            {takeLeaveType: {$eq: takeLeaveType}}
        ]}).sort({createdAt: -1}).limit(1)
        const lastTakeLeaveQty = getLastTakeLeaveQty.paymentOfTakeLeaveQuantity

        const getStaff = await StaffInfo.findById(staffId)
    
        if(takeLeaveType === 'Annual Leave'){
            const lastYearRemaining = lastTakeLeaveQty.totalRemaining
            //If AL remaining from last year over 10 staff get only 10, if less than or equal 10 staff get the same remaining.
            // And then, we take 18(new year AL) add with the AL remaining form last year. as the code below
            let newALQty = lastYearRemaining > 10 ? 18 + 10 : 18 + lastYearRemaining;
          
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: newALQty,
                totalUsed: 0,
                totalRemaining: newALQty
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
                totalRemaining: 366
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
            defaultTakeLeaveQuantity = {
                validUntil: validUntilDate,
                totalForAYear: 0,
                totalUsed: 0,
                totalRemaining: 0
            }
        }
        // else if(takeLeaveType === 'Unpaid Leave')
        
        // }

        const createTakeLeaveEarlyYear = await TakeLave({
            isAdjust: true,
            takeLeaveType: takeLeaveType,
            createdBy: staffId,
            paymentOfTakeLeaveQuantity: defaultTakeLeaveQuantity
        }).save()
    
    
    } catch (error) {
        console.log(error.message)
    }
    
}

export default paymentTakeLeaveEarlyYear