
const reportType = `#graphql
  
    type Query {
        getTakeLeaveReport(page:Int, limit:Int, fromDate:String, toDate:String, staffId: String, takeLeaveType: String): TakeLeavePagination
    }

`

export default reportType;