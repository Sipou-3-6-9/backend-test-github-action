import CovidVaccination from "../../models/covidVaccination.js"
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
const covidVaccinationResolver = {
    Query: {
        getStaffCovidVaccinationById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const findById = await CovidVaccination.findById(_id)
                return findById
            } catch (error) {
                return error
            }
        },
        getStaffCovidVaccinationPagination: async (_, { page, limit, keyword, pagination }, req) => {

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
                const getCovidVaccination = await CovidVaccination.paginate(query, options);
                return getCovidVaccination;
            } catch (error) {
                // return{
                //     success: false,
                //     message: error.message,
                // }
                return error
            }
        },
        getCovidVacinByStaffId: async (_, { staffId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getCovidVacinByStaff = await CovidVaccination.find({ staffInfoId: staffId })
                return getCovidVacinByStaff
            } catch (error) {
                console.log(error);
                return error
            }
        }
    },
    Mutation: {
        createStaffCovidVaccination: async (_, { staffInfoId, input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isCreated = await CovidVaccination({ staffInfoId: staffInfoId, ...input }).save()
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !",
                    }
                }
                const updateStaffInfo = await StaffInfo.updateOne(
                    { _id: staffInfoId },
                    { $push: { "otherInfo.covidVaccination": isCreated._id } }
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
                    actionOn: "Covid Vaccination",
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
        updateStaffCovidVaccination: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await CovidVaccination.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Covid Vaccination",
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
        deleteStaffCovidVaccination: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isDeleted = await CovidVaccination.findByIdAndDelete(_id);

                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const findStaffInfo = await StaffInfo.find(
                    { "otherInfo.covidVaccination": { $elemMatch: { $eq: _id } } }
                )


                const updateStaffInfo = await StaffInfo.updateOne(
                    { _id: findStaffInfo[0]._id },
                    { $pull: { "otherInfo.covidVaccination": _id } }
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
                    actionOn: "Covid Vaccination",
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
        }
    }
}
export default covidVaccinationResolver;