
import DrivingLicense from "../../models/drivingLicense.js"
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

const drivingLicenseResolver = {
    Query: {
        getStaffDrivingLicenseById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                const findById = await DrivingLicense.findById(_id).sort({createdAt: -1})
                return findById
            } catch (error) {
                return error
            }
        },
        getStaffDrivingLicensePagination: async (_, { page, limit, keyword, pagination }, req) => {
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
                    populate: "",
                };
                let query = {
                };
                const drivingLicence = await DrivingLicense.paginate(query, options);
                return drivingLicence;
            } catch (error) {
                return error
            }
        },
        getDrivingLincenseByStaffId: async (_, { staffId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getDrivingLincenseByStaff = await DrivingLicense.find({ staffInfoId: staffId }).sort({ createdAt: -1 })
                return getDrivingLincenseByStaff
            } catch (error) {
                // console.log(error);
                return error
            }
        }
    },
    Mutation: {
        createStaffDrivingLicense: async (_, { staffInfoId, input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isCreated = await DrivingLicense({ staffInfoId: staffInfoId, ...input }).save()

                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const updateInStaffInfo = await StaffInfo.updateOne(
                    { _id: staffInfoId },
                    { $push: { "otherInfo.drivingLicense": isCreated._id } }
                )

                if (!updateInStaffInfo) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Driving License",
                    actionType: "Created",
                    docId: isCreated._id
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
        updateStaffDrivingLicense: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await DrivingLicense.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Driving License",
                    actionType: "Updated",
                    docId: isUpdated._id
                }).save()

                return {
                    success: true,
                    message: "Updated successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        deleteStaffDrivingLicense: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isDeleted = await DrivingLicense.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const findStaffInfo = await StaffInfo.find(
                    { "otherInfo.drivingLicense": { $elemMatch: { $eq: _id } } }
                )

                const updateStaffInfo = await StaffInfo.updateOne(
                    { _id: findStaffInfo[0]._id },
                    { $pull: { "otherInfo.drivingLicense": _id } }
                )
                if (!updateStaffInfo) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Driving License",
                    actionType: "Deleted",
                    docId: isDeleted._id
                }).save()

                return {
                    success: true,
                    message: "Deleted successfully, thank you !"

                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        }
    }
}
export default drivingLicenseResolver;