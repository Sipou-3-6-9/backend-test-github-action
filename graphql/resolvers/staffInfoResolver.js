
import StaffInfo from "../../models/staffInfo.js"
import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import { verifyUser } from '../../helpers/userAuthentication.js'
import ActionLogs from '../../models/actionLogs.js';
import BirthdayReminder from '../../models/birthdayReminder.js'
import generateDefaultQtyAllTakeLeaveType from '../../functions/generateDefaultQtyAllTakeLeaveType.js'
import Contract from '../../models/contract.js'
import TakeLeave from '../../models/takeLeave.js'


const paginationLabels = {
    docs: "data",
    limit: "perPage",
    nextPage: "next",
    prevPage: "prev",
    meta: "paginator",
    page: "currentPage",
    pagingCounter: "slNo",
    totalDocs: "totalDocs",
    totalPages: "totalPages",
};

const staffInfoResolver = {
    Query: {
        getStaffInfoById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findStaffById = await StaffInfo.findById(_id)
                // .populate('systemAccessData.accessPermissions currentContract otherInfo.educationBackground otherInfo.drivingLicense otherInfo.covidVaccination')
                return findStaffById
            } catch (error) {
                return error
            }
        },
        getStaffInfoPagination: async (_, { page, limit, keyword, pagination, currentSituation }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const currentSituationQuery = currentSituation === undefined ? {} : { currentSituation: currentSituation };
                const options = {
                    page: page || 1,
                    limit: limit || 60,
                    pagination: pagination,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1
                    },
                    populate: [
                        {
                            path: 'currentContract',
                            populate: [
                                {
                                    path: 'positions',
                                    populate: [{ path: 'inDepartment' }]
                                },
                                { path: 'officeBase' },
                                { path: 'workingBase' },
                                { path: 'workingPlace' },
                            ]
                        },
                        { path: 'otherInfo.educationBackground' },
                        { path: 'otherInfo.drivingLicense' },
                        { path: 'otherInfo.covidVaccination' },
                    ],
                    // populate: "systemAccessData.accessPermissions currentContract otherInfo.educationBackground otherInfo.drivingLicense otherInfo.covidVaccination",
                }
                //@Query data from collection
                const query = {
                    $and: [
                        {
                            $or: [
                                { "staffProfile.englishData.firstNameLatin": { $regex: keyword, $options: "i" } },
                                { "staffProfile.englishData.lastNameLatin": { $regex: keyword, $options: "i" } },
                                { "staffProfile.khmerData.firstNameKh": { $regex: keyword, $options: "i" } },
                                { "staffProfile.khmerData.lastNameKh": { $regex: keyword, $options: "i" } },
                                { staffID: { $regex: keyword, $options: "i" } },
                            ],
                        },
                        currentSituationQuery,
                    ]

                }

                const getStaffInfo = await StaffInfo.paginate(query, options)
                // console.log(getStaffInfo, 'getStaffInfo')
                return getStaffInfo;

            } catch (error) {
                return error
            }
        }

    },
    Mutation: {
        createStaffInfo: async (_, { input }, req) => {

            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                // console.log("input::", input)
                const isEmailExisted = await StaffInfo.findOne({ 'systemAccessData.emailAddress': input.systemAccessData.emailAddress })
                if (isEmailExisted) {
                    return {
                        success: false,
                        message: "Unsuccessful, email is already token !"
                    }
                }
          
                const defaultPassword = await hash('2023@Pepy', 9)
           
                const isCreated = await StaffInfo({
                    ...input,
                    'systemAccessData.password': defaultPassword,
                }).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
           
                //@Create birthday reminder
                if (input.staffProfile.englishData.dateOfBirthEng) {
                    const createBirthdayReminder = new BirthdayReminder({
                        staffId: isCreated._id,
                        dob: isCreated.staffProfile.englishData.dateOfBirthEng,
                        day: isCreated.staffProfile.englishData.dateOfBirthEng.getDate(),
                        month: isCreated.staffProfile.englishData.dateOfBirthEng.getMonth() + 1,
                        rounds: []
                    })
                    const isBirthdayReminderCreated = createBirthdayReminder.save()
                    if (!isBirthdayReminderCreated) {
                        return {
                            success: false,
                            message: "Error occurred, please contact to software developer."
                        }
                    }
                }

                await generateDefaultQtyAllTakeLeaveType(isCreated._id, req)

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Staff Information",
                    actionType: "Created",
                    docId: isCreated._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }

            } catch (error) {
                console.log("Create Staff::", error.message);
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        updateStaffInfo: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
             
                const findStaffId = await StaffInfo.findById(_id);
                if (!findStaffId) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const systemAccessDataUpdate = { ...input.systemAccessData, password: findStaffId.systemAccessData.password }

                const isUpdated = await StaffInfo.findByIdAndUpdate(_id, {
                    ...input,
                    systemAccessData: systemAccessDataUpdate
                });

                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@Update birthday reminder 
                if (input.staffProfile.englishData.dateOfBirthEng) {
                    const staffUpdated = await StaffInfo.findById(_id);
                    const findBirthdayReminder = await BirthdayReminder.findOne({ staffId: _id })

                    const updateBirthdayReminder = await BirthdayReminder.findByIdAndUpdate(findBirthdayReminder._id, {
                        dob: staffUpdated.staffProfile.englishData.dateOfBirthEng,
                        day: staffUpdated.staffProfile.englishData.dateOfBirthEng.getDate(),
                        month: staffUpdated.staffProfile.englishData.dateOfBirthEng.getMonth() + 1,
                    })

                    if (!updateBirthdayReminder) {
                        return {
                            success: false,
                            message: "Error occurred, please contact to software developer."
                        }
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Staff Information",
                    actionType: "Updated",
                    docId: _id
                }).save()

                return {
                    success: true,
                    message: "Update successfully, thank you !"
                }
            } catch (error) {
                console.log(error.message, 'update staff info');
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        deleteStaffInfo: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findStaffId = await StaffInfo.findById(_id);
                if (!findStaffId) {
                    return {
                        success: false,
                        message: "Unsuccessful, Cannot find staff to delete !"
                    }
                }
                const isDeleted = await StaffInfo.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@Delete birthday reminder 
                const findBirthdayReminder = await BirthdayReminder.findOneAndDelete({ staffId: _id })
                if (!findBirthdayReminder) {
                    return {
                        success: false,
                        message: "Error occurred, please contact to software developer."
                    }
                }

                //@Delete contract
                const findAndDeleteContract = await Contract.deleteMany({staffInfoId: _id})
                if (!findAndDeleteContract) {
                    return {
                        success: false,
                        message: "Error occurred, please contact to software developer."
                    }
                }

                //@Delete take leave
                const findAndDeleteTakeLeave = await TakeLeave.deleteMany({createdBy: _id})
                if (!findAndDeleteTakeLeave) {
                    return {
                        success: false,
                        message: "Error occurred, please contact to software developer."
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Staff Information",
                    actionType: "Deleted",
                    docId: _id
                }).save()

                return {
                    success: true,
                    message: "Delete Successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },



    }
}


export default staffInfoResolver