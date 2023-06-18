import WorkingBase from '../../models/workingBase.js'
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js'
import Contract from '../../models/contract.js'

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

const workingBaseResolver = {
    Query: {
        getWorkingBaseById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await WorkingBase.findById(_id);
                return getData;
            } catch (error) {
                return error
            }
        },
        getWorkingBasePagination: async (_, { page, limit, keyword, pagination }, req) => {
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
                const getDataWithPagination = await WorkingBase.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createWorkingBase: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                //@Check existing name
                const isExisting = await WorkingBase.findOne({ workingBaseName: input.workingBaseName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Working base name already exists"
                    }
                }

                const isCreated = await WorkingBase(input).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Base",
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
        updateWorkingBase: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await WorkingBase.findOne({$and:[
                    {_id: {$ne: _id}},
                    {workingBaseName: input.workingBaseName},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Working base name already exists"
                    }
                    
                }
                //@Update
                const isUpdated = await WorkingBase.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Base",
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
        deleteWorkingBase: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await Contract.findOne({workingBase: _id})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete 
                const isDeleted = await WorkingBase.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Base",
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
export default workingBaseResolver;