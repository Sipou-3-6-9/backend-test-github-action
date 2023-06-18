
import ActionLogs from "../../models/actionLogs.js"
import {verifyUser} from '../../helpers/userAuthentication.js'

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
const actionLogsResolvers = {
    Query: {
        getActionLogsWithPagination: async (_, {page, limit, keyword, pagination,  fromDate, toDate}, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
                
                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    pagination: pagination,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1
                    },
                    populate:"user",
                   
                }
                let dateQuery = {}
                if(fromDate && toDate){
                    const fromDateFormate = `${fromDate}T00:00:00.000Z`
                    const toDateFormate = `${toDate}T16:59:59.999Z`
                    dateQuery = {'createdAt': {$gte: fromDateFormate, $lte: toDateFormate}}
                }
                //@Query data from collection
                const query = {$and:[
                    dateQuery
                ]}
          
                const getActionLogs = await ActionLogs.paginate(query, options)
                // console.log(getStaffInfo, 'getStaffInfo')
                return getActionLogs;

            } catch (error) {
                console.log(error, 'acivity logs');
                return error
            }
      },
    },
  };

  export default actionLogsResolvers