import OvertimeWork from '../../models/overtimeWork.js'
import TakeLave from '../../models/takeLeave.js';
import StaffInfo from '../../models/staffInfo.js';
import Positions from '../../models/positions.js';
import Contract from '../../models/contract.js'
import { geAllAdminEmail, getRequestTo } from '../../functions/generalFunction.js';
import { pendingStyle, approvedStyle, deniedStyle } from '../../functions/sendEmailCSSStyle.js';
import nodemailer from 'nodemailer';
import ActionLogs from '../../models/actionLogs.js';
import { verifyUser } from '../../helpers/userAuthentication.js';


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

const overtimeWorkResolver = {
    Query: {
        getOvertimeWorkById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await OvertimeWork.findById(_id).populate('createdBy approvedOrDeniedBy');
                return getData;
            } catch (error) {
                return error
            }
        },
        getOvertimeWorkPagination: async (_, { page, limit, keyword, pagination, userId, status }, req) => {
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
                    populate: "createdBy approvedOrDeniedBy",
                };

                //Get take leave by status
                const queryStatus = status ? { 'status': { $in: status } } : {}
                //Get take leave by created by
                const queryCreatedBy = userId ? {createdBy:{'$eq': userId}} : {}
                //Get take leave by requestTo by
                const queryRequestTo = userId ? {requestTo:{'$eq': userId}} : {}
                //Check Admin
                let getTakeleaveByUserRole = {
                    '$or': [
                        queryCreatedBy,
                        queryRequestTo,
                    ]
                }
                if(currentUser.role === 'Admin'){
                    getTakeleaveByUserRole = {}
                }

                let query = {
                    $and: [
                        getTakeleaveByUserRole,
                        queryStatus
                    ]
                };
                const getDataWithPagination = await OvertimeWork.paginate(query, options);
                return getDataWithPagination;
            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createOvertimeWork: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                //@Find request to 
                const requestToId = await getRequestTo(input.createdBy)
                if(requestToId === "contract not found!"){
                    return {
                        success: false,
                        message: "Create request failed. your positions not found, please contact admin."
                    }
                }

                const isCreated = await OvertimeWork({
                    ...input,
                    requestTo: requestToId
                }).save();
                if (!isCreated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                const requester = await StaffInfo.findById(input.createdBy)

                const requestTo = await StaffInfo.findById(requestToId)
                const emailTo = requestTo ?  requestTo.systemAccessData.emailAddress : ''

                const adminEmail = await geAllAdminEmail()


                //Email Alert for Pending Take Leave
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_ADDRESS,
                        pass: process.env.EMAIL_APP_PASSWORD
                        // user: testAccount.user,
                        // pass: testAccount.pass
                    }
                })

                //email message options 
                let mailOptions = {
                    from: process.env.EMAIL_ADDRESS,
                    to: emailTo,
                    cc: adminEmail,
                    // bcc: 'sipou.ssp2018@gmail.com',
                    subject: 'Overtime Work Request Pending',
                    html: `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <link
                        rel="stylesheet"
                        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                        />
                        <title>Overtime Work Request Pending</title>
                    
                        <style type="text/css">
                            ${pendingStyle()}
                        </style>
                    </head>
                    
                    <body>
                        <div class="div-container">
                        <center class="layout-container">
                            <div class="item-container">
                            <div class="header-image">
                                <div class="title-text">Overtime Work Request Pending</div>
                            </div>
                            <div class="item-details">
                    
                                <div class="description">
                                <p>Dear Manager,</p>
                                <p>
                                    <span class="des-name">${requester.staffProfile.englishData.firstNameLatin}</span> is requesting for overtime work. please respond by click on this link <a href="https://pepy-hrms-frontend.vercel.app/take-leave">PEPY HRMS</a> 
                                </p>
                               
                                <p>Kind Regards,</p>
                                </div>
                                <div class="img-container">
                                <img
                                    class="birthday-img"
                                    src="https://firebasestorage.googleapis.com/v0/b/summer-marker-327504.appspot.com/o/images%2Fundraw_Done_re_oak4.png?alt=media&token=6f321ece-de6f-44b8-8a7d-c783178048d6"
                                />
                                </div>
                            </div>
                            <div class="header-footer">
                                <h2 class="footer-title">PEPY HRMS</h2>
                                <div class="footer">
                                <p>Copyright @ PEPY empowering youth 2022</p>
                                </div>
                            </div>
                            </div>
                        </center>
                        </div>
                    </body>
                    </html>
                    `
                }

                //send email
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('Email send: ' + info.response)
                    }
                });

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Overtime Work",
                    actionType: "Created",
                    docId: isCreated._id
                }).save()

                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                console.log(error, "error");
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        updateOvertimeWork: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await OvertimeWork.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Overtime Work",
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
        deleteOvertimeWork: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isDeleted = await OvertimeWork.findByIdAndDelete(_id);
                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Overtime Work",
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
        },
        approveOvertime: async (_, { overtimeId, userId, managerReply }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const updateStatus = await OvertimeWork.findByIdAndUpdate(overtimeId, {
                    approvedOrDeniedBy: userId,
                    status: 'Approved',
                    managerReply: managerReply,
                    approvedOrDeniedDate: new Date()
                })
                if (!updateStatus) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }


                const getLastTakeLeaveQty = await TakeLave.findOne({
                    $and: [
                        { createdBy: { $eq: updateStatus.createdBy } },
                        { takeLeaveType: { $eq: 'Alternative Leave' } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)


                if (getLastTakeLeaveQty) {
                    const lastTakeLeaveQty = getLastTakeLeaveQty.paymentOfTakeLeaveQuantity
                    const updateQtyOT = await TakeLave.findByIdAndUpdate(getLastTakeLeaveQty._id, {
                        paymentOfTakeLeaveQuantity: {
                            ...getLastTakeLeaveQty.paymentOfTakeLeaveQuantity,
                            totalForAYear: lastTakeLeaveQty.totalForAYear + updateStatus.totalOvertimeAsDay,
                            totalRemaining: lastTakeLeaveQty.totalForAYear + updateStatus.totalOvertimeAsDay
                        },
                    })
                } else {
                    var validUntilDate;
                    let date = new Date()
                    const lastDayOfAug = new Date(date.getFullYear(), 8, 0).getDate()
                    if (date.getMonth() + 1 < 9) {
                        validUntilDate = new Date(`${date.getFullYear()}-08-${lastDayOfAug}T16:59:59.999Z`)
                    } else if (date.getMonth() + 1 >= 9) {
                        validUntilDate = new Date(`${date.getFullYear() + 1}-08-${lastDayOfAug}T16:59:59.999Z`)
                    }
                    const createTakeLeaveEarlyYear = await TakeLave({
                        isAdjust: true,
                        takeLeaveType: "Alternative Leave",
                        createdBy: updateStatus.createdBy,
                        paymentOfTakeLeaveQuantity: {
                            validUntil: validUntilDate,
                            totalForAYear: updateStatus.totalOvertimeAsDay,
                            totalUsed: 0,
                            totalRemaining: updateStatus.totalOvertimeAsDay
                        }
                    }).save()

                }

                const requester = await StaffInfo.findById(updateStatus.createdBy)

                const adminEmail = await geAllAdminEmail()

                //Email Alert For Approved Take Leave
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_ADDRESS,
                        pass: process.env.EMAIL_APP_PASSWORD
                        // user: testAccount.user,
                        // pass: testAccount.pass
                    }
                })

                //email message options for Approve take leave
                let mailOptions = {
                    from: process.env.EMAIL_ADDRESS,
                    to: requester.systemAccessData.emailAddress,
                    cc: adminEmail,
                    // bcc: 'sipou.ssp2018@gmail.com',
                    subject: 'Your Overtime Work Approved',
                    html: `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8" />
                                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <link
                                rel="stylesheet"
                                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                                />
                                <title>Overtime Work Approved</title>
                            
                                <style type="text/css">
                                    ${approvedStyle()}
                                </style>
                            </head>
                            
                            <body>
                                <div class="div-container">
                                <center class="layout-container">
                                    <div class="item-container">
                                    <div class="header-image">
                                        <div class="title-text">Overtime Work Approved</div>
                                    </div>
                                    <div class="item-details">
                            
                                        <div class="description">
                                        <p>Dear ${requester.staffProfile.englishData.firstNameLatin},</p>
                                        <p>
                                            Your overtime work request has been <span class="des-name">Approved</span>
                                        </p>
                                        
                                        <p>Kind Regards,</p>
                                        </div>
                                        <div class="img-container">
                                        <img
                                            class="birthday-img"
                                            src="https://firebasestorage.googleapis.com/v0/b/summer-marker-327504.appspot.com/o/images%2Fundraw_Done_re_oak4.png?alt=media&token=6f321ece-de6f-44b8-8a7d-c783178048d6"
                                        />
                                        </div>
                                    </div>
                                    <div class="header-footer">
                                        <h2 class="footer-title">PEPY HRMS</h2>
                                        <div class="footer">
                                        <p>Copyright @ PEPY empowering youth 2022</p>
                                        </div>
                                    </div>
                                    </div>
                                </center>
                                </div>
                            </body>
                            </html>
                            `
                }

                //send email
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('Email send: ' + info.response)
                    }
                });

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Overtime Work",
                    actionType: "Approved",
                    docId: overtimeId
                }).save()

                return {
                    success: true,
                    message: "Approved successfully"
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        denyOvertime: async (_, { overtimeId, userId, managerReply }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const updateStatus = await OvertimeWork.findByIdAndUpdate(overtimeId, {
                    approvedOrDeniedBy: userId,
                    status: 'Denied',
                    managerReply: managerReply,
                    approvedOrDeniedDate: new Date()
                })
                if (!updateStatus) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                const requester = await StaffInfo.findById(updateStatus.createdBy)

                const adminEmail = await geAllAdminEmail()

                //Email Alert for Overtime Work Denied
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_ADDRESS,
                        pass: process.env.EMAIL_APP_PASSWORD
                        // user: testAccount.user,
                        // pass: testAccount.pass
                    }
                })

                //email message options
                let mailOptions = {
                    from: process.env.EMAIL_ADDRESS,
                    to: requester.systemAccessData.emailAddress,
                    cc: adminEmail,
                    // bcc: 'sipou.ssp2018@gmail.com',
                    subject: 'Your Overtime Work Denied',
                    html: `
                                <!DOCTYPE html>
                                <html lang="en">
                                <head>
                                    <meta charset="UTF-8" />
                                    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                    <link
                                    rel="stylesheet"
                                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
                                    />
                                    <title>Overtime Work Denied</title>
                                
                                    <style type="text/css">
                                        ${deniedStyle()}
                                    </style>
                                </head>
                                
                                <body>
                                    <div class="div-container">
                                    <center class="layout-container">
                                        <div class="item-container">
                                        <div class="header-image">
                                            <div class="title-text">Overtime Work Denied</div>
                                        </div>
                                        <div class="item-details">
                                
                                            <div class="description">
                                            <p>Dear ${requester.staffProfile.englishData.firstNameLatin},</p>
                                            <p>
                                                Your overtime work request has been <span class="des-name">Denied</span>
                                            </p>
                                           
                                            <p>Kind Regards,</p>
                                            </div>
                                            <div class="img-container">
                                            <img
                                                class="birthday-img"
                                                src="https://firebasestorage.googleapis.com/v0/b/employee-management-25c3a.appspot.com/o/undraw_Cancel_re_pkdm.png?alt=media&token=f722fa74-b85e-4e26-8c2b-29a4358ac664"
                                            />
                                            </div>
                                        </div>
                                        <div class="header-footer">
                                            <h2 class="footer-title">PEPY HRMS</h2>
                                            <div class="footer">
                                            <p>Copyright @ PEPY empowering youth 2022</p>
                                            </div>
                                        </div>
                                        </div>
                                    </center>
                                    </div>
                                </body>
                                </html>
                                `
                }

                //send email
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log('Email send: ' + info.response)
                    }
                });

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Overtime Work",
                    actionType: "Denied",
                    docId: overtimeId
                }).save()

                return {
                    success: true,
                    message: "Denied successfully"
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
export default overtimeWorkResolver
