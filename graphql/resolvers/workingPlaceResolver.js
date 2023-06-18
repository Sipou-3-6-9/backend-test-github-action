import WorkingPlace from '../../models/workingPlace.js'
import ActionLogs from '../../models/actionLogs.js';
import {verifyUser} from '../../helpers/userAuthentication.js'
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

const workingPlaceResolver = {
    Query: {
        getWorkingPlaceById: async (_, {_id}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await WorkingPlace.findById(_id);
                return getData;
            } catch (error) {
                return error
            }
        },
        getWorkingPlacePagination: async (_, { page, limit, keyword, pagination }, req) => {
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
                const getDataWithPagination = await WorkingPlace.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },  
    Mutation: {
        createWorkingPlace: async (_, {input}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check existing name
                const isExisting = await WorkingPlace.findOne({ workingPlaceName: input.workingPlaceName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Working place name already exists"
                    }
                }
                //@Create
                const isCreated = await WorkingPlace(input).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Place",
                    actionType: "Created",
                    docId: isCreated._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                return{
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        }, 
        updateWorkingPlace:async (_, {input, _id}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await WorkingPlace.findOne({$and:[
                    {_id: {$ne: _id}},
                    {workingPlaceName: input.workingPlaceName},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Working place name already exists"
                    }
                    
                }
                //@Update
                const isUpdated = await WorkingPlace.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Place",
                    actionType: "Updated",
                    docId: _id
                }).save()

                return{
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
        deleteWorkingPlace:async (_, {_id}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await Contract.findOne({workingPlace: _id})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete
                const isDeleted = await WorkingPlace.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Working Place",
                    actionType: "Deleted",
                    docId: _id
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
export default workingPlaceResolver;