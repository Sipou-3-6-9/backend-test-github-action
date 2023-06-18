
import TakeLeave from '../../models/takeLeave.js'
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

const reportsResolver = {
    Query: {
        getTakeLeaveReport: async (_, { page, limit, fromDate, toDate, staffId, takeLeaveType }, req) => {
            try {

                //@User Authentication
                const currentUser = await verifyUser(req)

                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    pagination: true,
                    customLabels: paginationLabels,
                    sort: {
                        createdAt: -1,
                    },
                    populate: [
                        {path: "approvedOrDeniedBy requestTo"},
                        {
                            path: "createdBy",
                            populate: [
                                {
                                    path: "currentContract",
                                    populate: [
                                        {path: "positions"}
                                    ]
                                }
                            ]
                        }
                    ],
                }
                //@Query by date between
                let queryByDate = {}
                if(fromDate && toDate){
                    const startDate = new Date(`${fromDate}T00:00:00.000Z`)
                    const endDate = new Date(`${toDate}T16:59:59.999Z`)
                    console.log(startDate, "startDate");
                    console.log(endDate, "endDate");
                    queryByDate = {createdAt: {$gte:startDate, $lte:endDate}}
                }
                //@Query By staff
                const queryByStaff = staffId ? {createdBy: staffId} : {}
                //@Query By take leave type
                const queryByTakeLeaveType = takeLeaveType ? {takeLeaveType: takeLeaveType} : {}
                //@Query data from collection
                const query = {
                    $and: [
                        {isAdjust: false},
                        queryByDate,
                        queryByStaff,
                        queryByTakeLeaveType,
                    ]
                }
                const getTakeLeave = await TakeLeave.paginate(query, options);
               
                return getTakeLeave;
            } catch (error) {
                return error
            }
        },
    },

}

export default reportsResolver;