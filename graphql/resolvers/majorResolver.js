import Major from '../../models/major.js'
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js'
import EducationQualification from '../../models/educationQualification.js'

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

const majorResolver = {
    Query: {
        getMajorById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await Major.findById(_id);
                return getData;
            } catch (error) {
                return error
            }
        },
        getMajorWithPagination: async (_, { page, limit, keyword, pagination }, req) => {
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
                const getDataWithPagination = await Major.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createMajor: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check existing name
                const isExisting = await Major.findOne({ majorName: input.majorName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Major name already exists"
                    }
                }
                //@Create
                const isCreated = await Major(input).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Major",
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
        updateMajor: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await Major.findOne({$and:[
                    {_id: {$ne: _id}},
                    {majorName: input.majorName},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Major name already exists"
                    }
                    
                }
                //@Update
                const isUpdated = await Major.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Major",
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
        deleteMajor: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await EducationQualification.findOne({major: _id})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete
                const isDeleted = await Major.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Major",
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
export default majorResolver;