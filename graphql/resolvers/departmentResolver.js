import Department from '../../models/department.js'
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js'
import Positions from '../../models/positions.js'

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

const departmentResolver = {
    Query: {
        getDepartmentById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await Department.findById(_id);
                return getData;
            } catch (error) {
                return error
            }
        },
        getDepartmentsPagination: async (_, { page, limit, keyword, pagination }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    pagination: pagination,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1,
                    },
                    populate: "",
                }
                //@Query data from collection
                const query = {
                    $or: [
                        { departmentName: { $regex: keyword, $options: "i" } },
                    ],
                }
                const getDataWithPagination = await Department.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createDepartment: async (_, { input }, req) => {

            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check existing name
                const isExisting = await Department.findOne({ departmentName: input.departmentName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Department name already exists"
                    }
                }
                //@Create
                const isCreated = await Department(input).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Department",
                    actionType: "Created",
                    docId: isCreated._id
                }).save()

                return {
                    success: true,
                    message: "Created successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        updateDepartment: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await Department.findOne({$and:[
                    {_id: {$ne: _id}},
                    {departmentName: input.departmentName},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Department name already exists"
                    }
                    
                }
                //@Update
                const isUpdated = await Department.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Department",
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
        deleteDepartment: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await Positions.findOne({inDepartment: _id})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete
                const isDeleted = await Department.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Department",
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


export default departmentResolver