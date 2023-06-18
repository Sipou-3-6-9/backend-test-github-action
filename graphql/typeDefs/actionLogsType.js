

const actionLogsType = `#graphql

type Query {
  getActionLogsWithPagination(page:Int, limit:Int, keyword:String, pagination:Boolean, fromDate: Date, toDate: Date): actionLogsPaginator
}
type actionLogs {
    user: StaffInfo
    actionOn: String
    actionType: String
    docId: String
    createdAt: Date
    updatedAt: Date
}
type actionLogsPaginator{
    paginator: Paginator
    data: [actionLogs]
}


`;
 
export default actionLogsType