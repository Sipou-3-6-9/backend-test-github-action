import Contract from "../../models/contract.js"
import StaffInfo from "../../models/staffInfo.js"
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js'

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
const contractResolver = {
    Query: {
        getContractById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findById = await Contract.findById(_id).populate(
                    [
                        { path: 'officeBase workingBase workingPlace' },
                        {
                            path: 'positions',
                            populate: [{ path: 'inDepartment' }],

                        },

                    ]
                )
                return findById
            } catch (error) {
                return error
            }
        },
        getContractPagination: async (_, { page, limit, keyword, pagination }, req) => {

            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    customLabels: paginationLabels,
                    pagination: pagination,
                    sort: {
                        createdAt: -1,
                    },
                    populate: [
                        { path: 'officeBase workingBase workingPlace' },
                        {
                            path: 'positions',
                            populate: [{ path: 'inDepartment' }],

                        },
                    ],
                };
                let query = {
                };
                const getCovidVaccination = await Contract.paginate(query, options);
                return getCovidVaccination;
            } catch (error) {
                // return{
                //     success: false,
                //     message: error.message,
                // }
                return error
            }
        },
        getContractByStaffId: async (_, { staffId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getContractByStaff = await Contract.find({ staffInfoId: staffId })
                    // .populate('positions officeBase workingBase workingPlace')
                    .populate([
                        { path: 'officeBase workingBase workingPlace' },
                        {
                            path: 'positions',
                            populate: [{ path: 'inDepartment' }],

                        },

                    ]).sort({ createdAt: -1 })

                return getContractByStaff
            } catch (error) {
                console.log(error);
                return error
            }
        }
    },
    Mutation: {
        createContract: async (_, { staffInfoId, input }, req) => {
            try {
       
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isCreated = await Contract({ staffInfoId: staffInfoId, ...input }).save()
               
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !",
                    }
                }

                if (isCreated.isActive === true) {
                    await StaffInfo.findByIdAndUpdate(staffInfoId, { currentContract: isCreated._id })
                    await Contract.updateMany(
                        {
                            _id: { $ne: isCreated._id },
                            staffInfoId: { $eq: isCreated.staffInfoId }
                        },
                        { $set: { isActive: false } }
                    )
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Contract",
                    actionType: "Created",
                    docId: isCreated._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                // console.log(error.message, "Create contract");
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        updateContract: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await Contract.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Contract",
                    actionType: "Updated",
                    docId: isUpdated._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        deleteContract: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const check = await Contract.findById(_id);
                if (check.isActive === true)
                    return {
                        status: false,
                        message: "This Contract is Active, Delete Contract Unsuccessful!",
                    };
                const isDeleted = await Contract.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Contract",
                    actionType: "Deleted",
                    docId: isDeleted._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        editContractStatus: async (__, { _id, isActive }, req) => {
            // let currentUser = await authCheck(req)
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findContract = await Contract.findById(_id);
                if (!findContract)
                    return {
                        success: false,
                        message: "Update Contract Unsuccessful!",
                    };

                if (isActive === true) {
                    await StaffInfo.findByIdAndUpdate(findContract.staffInfoId, { currentContract: _id })
                    await Contract.findByIdAndUpdate(_id, {
                        isActive: isActive,
                    });
                    await Contract.updateMany(
                        {
                            _id: { $ne: _id },
                            staffInfoId: { $eq: findContract.staffInfoId }

                        },
                        {
                            $set: {
                                isActive: false,
                            },
                        }
                    );
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Contract",
                    actionType: "Edit Status",
                    docId: _id
                }).save()

                return {
                    success: true,
                    message: "Update Latest Contract Successfully!",
                };

            } catch (error) {
                return {
                    message: error.message,
                    success: false,
                };
            }
        },
    }
}
export default contractResolver;