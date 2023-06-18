import Documents from '../../models/documents.js'
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

const documentResolver = {
    Query: {
        getDocumentPagination: async (_, { page, limit, keyword, pagination, staffId }, req) => {
            try {
                // //@User Authentication
                // const currentUser = await verifyUser(req)
            
                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    pagination: pagination,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1,
                    },
                    populate: "staffInfoId",
                }
                //@Query data from collection
                const query = {
                    $and:[
                        {staffInfoId: staffId},
                        {
                            $or: [
                                { documentName: { $regex: keyword, $options: "i" } },
                            ],
                        }
                    ]
                }
                const getDataWithPagination = await Documents.paginate(query, options);
    
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        uploadStaffDocument: async(_, {input}, req)=>{
            try {
                const updateStaffDocument = await Documents(input).save()

                return {
                    success: true,
                    message: "Successfully, thank you !"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        renameDocument: async (_, { _id, documentName}, req) => {
            try {
                // //@User Authentication
                // const currentUser = await verifyUser(req)
                
                //@Update
                const isUpdated = await Documents.findByIdAndUpdate(_id, {documentName: documentName});

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
        deleteDocument: async (_, { _id }, req) => {
            try {
                // //@User Authentication
                // const currentUser = await verifyUser(req)

                //@Delete
                const isDeleted = await Documents.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

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


export default documentResolver