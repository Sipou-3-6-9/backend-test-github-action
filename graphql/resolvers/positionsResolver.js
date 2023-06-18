
import Positions from '../../models/positions.js'
import Department from '../../models/department.js'
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

const positionsResolver = {
    Query: {
        getPositionsById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                const findPositionsById = await Positions.findById(_id).populate('inDepartment managerPositions')
                return findPositionsById
            } catch (error) {
                return error
            }
        },
        getPositionsWithPagination: async (_, { page, limit, keyword, pagination, departmentId }, req) => {
            try {

                //@User Authentication
                const currentUser = await verifyUser(req)

                const queryByDepartmentId = departmentId ? { 'inDepartment': departmentId } : {}

                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    pagination: pagination,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1,
                    },
                    populate: "inDepartment managerPositions",
                }
                //@Query data from collection
                const query = {
                    $and: [
                        {
                            $or: [
                                { positionName: { $regex: keyword, $options: "i" } },
                            ],
                        },
                        queryByDepartmentId,
                    ]
                }
                const getPositions = await Positions.paginate(query, options);
               
                return getPositions;
            } catch (error) {
                return error
            }
        },
        getPositionsByDepartmentId: async (_, { departmentId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                // const department = await Department.findById(departmentId).populate('teamAssigned.position')
                // const positionsByDepartment = department.teamAssigned
                // const prepare_data = positionsByDepartment.map(e => e.position)
                const positionsByDepartment = await Positions.find({ inDepartment: departmentId }).populate("inDepartment")

                return positionsByDepartment

            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createPositions: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check existing name
                const isExisting = await Positions.findOne({ positionName: input.positionName });
                if (isExisting) {
                    return {
                        success: false,
                        message: "Positions name already exists"
                    }
                }
               
                //@Create
                const positions = new Positions(input)
                const isCreated = await positions.save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Positions",
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
        updatePositions: async (_, { input, positionsId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@check existing
                const isExisting = await Positions.findOne({$and:[
                    {_id: {$ne: positionsId}},
                    {$or:[
                        {positionName: input.positionName},
                        {positionNameKhmer: input.positionNameKhmer,}
                    ]},
                ]})
                if(isExisting){
                    return {
                        success: false,
                        message: "Positions name already exists"
                    }
                    
                }
                //@Update positions
                const isUpdated = await Positions.findByIdAndUpdate(positionsId, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Positions",
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
        deletePositions: async (_, { positionsId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                //@Check is using
                const isInUse = await Contract.findOne({positions: positionsId})
                if(isInUse){
                    return {
                        success: false,
                        message: "Cannot delete, this data is in use."
                    }                  
                }
                //@Delete
                const isDeleted = await Positions.findByIdAndDelete(positionsId);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Positions",
                    actionType: "Deleted",
                    docId: isDeleted._id
                }).save()

                return {
                    success: true,
                    message: "Delete successfully, thank you !"
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

export default positionsResolver;