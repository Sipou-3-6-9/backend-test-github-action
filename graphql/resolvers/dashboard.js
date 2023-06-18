import Department from '../../models/department.js'
import StaffInfo from '../../models/staffInfo.js';
import DrivingLicense from '../../models/drivingLicense.js';
import CovidVaccination from '../../models/covidVaccination.js';
import TakeLeave from '../../models/takeLeave.js'
import OvertimeWork from '../../models/overtimeWork.js';
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js'
import { GraphQLError } from 'graphql';
import Contract from '../../models/contract.js'
import mongoose from 'mongoose';

const dashboardResolvers = {
    Query: {
        totalDepartment: async (_, { }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                console.log(currentUser, "currentUser");
                const total = await Department.countDocuments()
                return total
            } catch (error) {
                return error
            }
        },
        totalStaff: async (_, { }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const total = await StaffInfo.aggregate([
                    { $match: {_id: {$ne: mongoose.Types.ObjectId('641877d7c75cf00e0fc814f1')}}}, //Developer, not staff
                    { $match: { currentSituation: 'Working' } },
                    { $group: { _id: null, totalStaff: { $sum: 1 } } }
                ]);
                return total[0].totalStaff
            } catch (error) {
                return error
            }
        },
        totalStaffHaveDrivingLicense: async (_, { }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const total = await DrivingLicense.aggregate([
                    { $match: { expiryDate: { $gte: new Date() } } },
                    {
                        $group: {
                            _id: { staffInfoId: "$staffInfoId" },
                        }
                    }
                ]);
                return total.length
            } catch (error) {
                return error
            }
        },
        totalStaffCovidVaccinated: async (_, { }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const total = await CovidVaccination.aggregate([
                    { $match: {} },
                    {
                        $group: {
                            _id: { staffInfoId: "$staffInfoId" },
                            totalDoses: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            count: {
                                $cond: { if: { $gte: ["$totalDoses", 4] }, then: 1, else: 0 }
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$count" }
                        }
                    }
                ])

                return total[0].total
            } catch (error) {
                return error
            }
        },
        getPersonalTakeLeaveChart: async (_, { userId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                let totalRemaining = []
                let totalUsed = []

                // @Annual leave
                const getAnnualLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Annual Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)


                if (getAnnualLeave) {
                    totalRemaining.push(getAnnualLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getAnnualLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                // @Sick leave
                const getSickLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Sick Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)
                if (getSickLeave) {
                    totalRemaining.push(getSickLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getSickLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                // @Alternative Leave
                const getAlternativeLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Alternative Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)

                if (getAlternativeLeave) {
                    totalRemaining.push(getAlternativeLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getAlternativeLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                // // @Maternity/Paternity Leave
                // const getMaternityLeave = await TakeLeave.findOne({
                //     $and: [
                //         { createdBy: { $eq: userId } },
                //         { takeLeaveType: { $in: ['Maternity Leave', 'Paternity Leave'] } }
                //     ]
                // }).sort({ createdAt: -1 }).limit(1)
                // if (getMaternityLeave) {
                //     totalRemaining.push(getMaternityLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                //     totalUsed.push(getMaternityLeave.paymentOfTakeLeaveQuantity.totalUsed)
                // } else {
                //     totalRemaining.push(0)
                //     totalUsed.push(0)
                // }

                // @Compassionate(wedding) Leave 
                const getCompassionateWeddingLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Compassionate(wedding) Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)
                if (getCompassionateWeddingLeave) {
                    totalRemaining.push(getCompassionateWeddingLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getCompassionateWeddingLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                // @Compassionate(death) Leave 
                const getCompassionateDeathLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Compassionate(death) Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)
                if (getCompassionateDeathLeave) {
                    totalRemaining.push(getCompassionateDeathLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getCompassionateDeathLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                // // @Compassionate Leave 
                // const getCompassionateWeddingLeave = await TakeLeave.findOne({
                //     $and: [
                //         { createdBy: { $eq: userId } },
                //         { takeLeaveType: { $eq: 'Compassionate(wedding) Leave' } }
                //     ]
                // }).sort({ createdAt: -1 }).limit(1)
                // console.log(getCompassionateWeddingLeave, "getCompassionateWeddingLeave");
                // const getCompassionateDeathLeave = await TakeLeave.findOne({
                //     $and: [
                //         { createdBy: { $eq: userId } },
                //         { takeLeaveType: { $eq: 'Compassionate(death) Leave' } }
                //     ]
                // }).sort({ createdAt: -1 }).limit(1)
                // console.log(getCompassionateDeathLeave, "getCompassionateDeathLeave");
                // let remainingWeddingLeave = 7
                // let totalUsedWeddingLeave = 0
                // let remainingDeathLeave = 3
                // let totalUsedDeathleave = 0
                // if (getCompassionateWeddingLeave) {
                //     remainingWeddingLeave = getCompassionateWeddingLeave.paymentOfTakeLeaveQuantity.totalRemaining
                //     totalUsedWeddingLeave = getCompassionateWeddingLeave.paymentOfTakeLeaveQuantity.totalUsed
                // } 
                // if(getCompassionateDeathLeave){
                //     // remainingDeathLeave = getCompassionateDeathLeave
                //     totalUsedDeathleave = getCompassionateDeathLeave.paymentOfTakeLeaveQuantity.totalUsed
                // }
                // totalRemaining.push(remainingWeddingLeave+remainingDeathLeave)
                // totalUsed.push(totalUsedWeddingLeave+totalUsedDeathleave)

                // Unpaid Leave
                const getUnpaidLeave = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: userId } },
                        { takeLeaveType: { $eq: 'Unpaid Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)
                if (getUnpaidLeave) {
                    totalRemaining.push(getUnpaidLeave.paymentOfTakeLeaveQuantity.totalRemaining)
                    totalUsed.push(getUnpaidLeave.paymentOfTakeLeaveQuantity.totalUsed)
                } else {
                    totalRemaining.push(0)
                    totalUsed.push(0)
                }

                return {
                    totalRemaining,
                    totalUsed
                }
            } catch (error) {
                console.log(error.message, "take leave chart");
                return error
            }
        },
        lastTakeLeave: async (_, { userId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                let lastTakeLeave = null
                const getStaff = await StaffInfo.findById(userId)
                const role = getStaff.systemAccessData.role
                if (role === 'User') {
                    lastTakeLeave = await TakeLeave.find({
                        $and: [
                            { isAdjust: false },
                            { createdBy: { $eq: userId } }
                        ]
                    }).sort({ createdAt: -1 }).limit(4).populate('createdBy approvedOrDeniedBy')
                } else if (role === 'Admin') {
                    lastTakeLeave = await TakeLeave.find({ isAdjust: false }).sort({ createdAt: -1 }).limit(4).populate('createdBy approvedOrDeniedBy')
                }

                return lastTakeLeave

            } catch (error) {
                return error
            }
        },
        lastOvertime: async (_, { userId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                let lastOvertime = null
                const getStaff = await StaffInfo.findById(userId)
                const role = getStaff.systemAccessData.role
                if (role === 'User') {
                    lastOvertime = await OvertimeWork.find({ createdBy: { $eq: userId } }).sort({ createdAt: -1 }).limit(4).populate('createdBy approvedOrDeniedBy')
                } else if (role === 'Admin') {
                    lastOvertime = await OvertimeWork.find().sort({ createdAt: -1 }).limit(4).populate('createdBy approvedOrDeniedBy')
                }

                return lastOvertime

            } catch (error) {
                return error
            }
        },
        staffStatistic: async(_, {}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getStaffStatistic = await Contract.aggregate([
                    {$match:{isActive:{$eq:true}}},
                    {
                        $group:{
                            _id: "$typeOfEmployment",
                            total: {$sum: 1}
                        }
                    },
                ]);
                let fullTime = 0
                let partTime = 0
                let probation = 0
                let internship = 0
                let volunteer = 0

                if(getStaffStatistic.length > 0){
                    getStaffStatistic.map(e => {
                        if(e._id === 'Full Time'){
                            fullTime = e.total
                        }else if(e._id === 'Part Time'){
                            partTime = e.total
                        }else if(e._id === 'Probation'){
                            probation = e.total
                        }else if(e._id === 'Internship'){
                            internship = e.total
                        }else if(e._id === 'Volunteer'){
                            volunteer = e.total
                        }
                    })
                }
                
                return {
                    series: [fullTime, partTime, probation, internship, volunteer],
                    label: ['Full Time', 'Part Time', 'Probation', 'Internship', 'Volunteer']
                }
                
            } catch (error) {
                
            }
        }
    },
};

export default dashboardResolvers