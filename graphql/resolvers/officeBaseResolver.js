import OfficeBase from '../../models/officeBase.js'
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

const officeBaseResolver = {
    Query: {
        getOfficeBaseById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await OfficeBase.findById(_id);
                return getData;
            } catch (error) {
                return error
            }
        },
        getOfficeBasesPagination: async (_, { page, limit, keyword, pagination }, req) => {
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
                const getDataWithPagination = await OfficeBase.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createOfficeBase: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check existing name
                const isExisting = await OfficeBase.findOne({ officeBaseName: input.officeBaseName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Office base name already exists"
                    }
                }
                //@Create
                const isCreated = await OfficeBase(input).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Office Base",
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
        updateOfficeBase: async (_, { input, _id }, req) => {
            try {

                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await OfficeBase.findOne({$and:[
                    {_id: {$ne: _id}},
                    {officeBaseName: input.officeBaseName},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Office base name already exists"
                    }
                    
                }
                //@Update
                const isUpdated = await OfficeBase.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Office Base",
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
        deleteOfficeBase: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await Contract.findOne({officeBase: _id})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete
                const isDeleted = await OfficeBase.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Office Base",
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
export default officeBaseResolver;