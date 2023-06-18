import EducationQualification from "../../models/educationQualification.js"
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
const educationResolver = {
    Query: {
        getEducationQualificationById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findById = EducationQualification.findById(_id).sort({createdAt: -1})
                return findById
            } catch (error) {
                return error
            }
        },
        getEducationQualificationPagination: async (_, { page, limit, keyword, pagination }) => {
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
                    populate: "major",
                };
                let query = {};
                const education = await EducationQualification.paginate(query, options);
                return education;
            } catch (error) {
                return error
            }
        },
        getEducationByStaffId: async (_, { staffId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getEducationByStaff = await EducationQualification.find({ staffInfoId: staffId }).populate('major').sort({ createdAt: -1 })
                return getEducationByStaff
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createStaffEducation: async (_, { input, staffInfoId }, req) => {

            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isCreated = await EducationQualification({ staffInfoId: staffInfoId, ...input }).save()
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                const updateStaffInfo = await StaffInfo.updateOne(
                    { _id: staffInfoId },
                    { $push: { "otherInfo.educationBackground": isCreated._id } }
                )
                if (!updateStaffInfo) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !",
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Education Qualification",
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
        updateStaffEducation: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await EducationQualification.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Education Qualification",
                    actionType: "Updated",
                    docId: isUpdated._id
                }).save()

                return {
                    success: true,
                    message: "Update successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        deleteStaffEducation: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isDeleted = await EducationQualification.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const findStaffInfo = await StaffInfo.find(
                    { "otherInfo.educationBackground": { $elemMatch: { $eq: _id } } }
                )

                const updateStaffInfo = await StaffInfo.updateOne(
                    { _id: findStaffInfo[0]._id },
                    { $pull: { "otherInfo.educationBackground": _id } }
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
                    actionOn: "Education Qualification",
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

export default educationResolver;