

const dashboardType = `#graphql

type Query {
    totalDepartment: Int
    totalStaff: Int
    totalStaffHaveDrivingLicense: Int
    totalStaffCovidVaccinated: Int
    getPersonalTakeLeaveChart(userId: ID!): PersonalTakeLeaveChart
    lastTakeLeave(userId: ID!): [TakeLave]
    lastOvertime(userId: ID!): [OvertimeWork]
    staffStatistic: StaffStatistic
}
type PersonalTakeLeaveChart{
    totalRemaining: [Float]
    totalUsed: [Float]
}
type StaffStatistic{
    series: [Int]
    label: [String]
}

`;
 
export default dashboardType