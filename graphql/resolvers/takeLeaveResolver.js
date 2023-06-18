import TakeLeave from '../../models/takeLeave.js'
import defaultAdjustTakeLeave from '../../functions/defaultAdjustTakeLeave.js'
import paymentTakeLeaveEarlyYear from '../../functions/paymentTakeLeaveEarlyYear.js'
import StaffInfo from '../../models/staffInfo.js';
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

const takeLeaveResolver = {
    Query: {
        getTakeLeaveById: async (_, { _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getData = await TakeLeave.findById(_id).populate('createdBy approvedOrDeniedBy');
                return getData;

            } catch (error) {
                return error
            }
        },
        getTakeLeaveWithPagination: async (_, { page, limit, keyword, pagination, userId, status, adjust }, req) => {
            try {

                // @User Authentication
                const currentUser = await verifyUser(req)
                console.log(currentUser, "currentUser");

                const options = {
                    page: page || 1,
                    limit: limit || 10,
                    customLabels: paginationLabels,
                    pagination: pagination,
                    sort: {
                        createdAt: -1,
                    },
                    populate: "createdBy approvedOrDeniedBy requestTo",
                };

                //Get take leave by status
                const queryStatus = status ? { 'status': { $in: status } } : {}
                //Get take leave by isAdjust
                const queryAdjust = adjust === true ? { 'isAdjust': true } : { 'isAdjust': false }
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
                        queryAdjust,
                        queryStatus
                    ]
                };

                const getDataWithPagination = await TakeLeave.paginate(query, options);

                return getDataWithPagination;

            } catch (error) {
                return error
            }
        },
        getPaymentOfTakeLeaveQty: async (_, { staffId, takeLeaveType }, req) => {
            try {

                //@User Authentication
                const currentUser = await verifyUser(req)

                const getTakeLeaveQty = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: staffId } },
                        { takeLeaveType: { $eq: takeLeaveType } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)

                const currDate = new Date()

                if (!getTakeLeaveQty) {
                    //Call function for create default adjust base on Take Leave type
                    await defaultAdjustTakeLeave(staffId, takeLeaveType)
                } else if (getTakeLeaveQty.paymentOfTakeLeaveQuantity.validUntil.getFullYear() !== currDate.getFullYear()) {
                    //Call functionn for calculate and generate new take leave payment
                    await paymentTakeLeaveEarlyYear(staffId, takeLeaveType)
                }

                const finalTakeLeaveQty = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: staffId } },
                        { takeLeaveType: { $eq: takeLeaveType } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)


                return finalTakeLeaveQty.paymentOfTakeLeaveQuantity

            } catch (error) {
                return error
            }
        },
        getTakeLeaveTypeByUserId: async (_, { userId }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const getUserById = await StaffInfo.findById(userId)
                // console.log(getUserById, "getUserById")
                var takeLeaveType = [
                    'Annual Leave',
                    'Sick Leave',
                    'Alternative Leave',
                    'Maternity Leave',
                    'Paternity Leave',
                    'Breastfeeding',
                    'Compassionate(wedding) Leave',
                    'Compassionate(death) Leave',
                    'Unpaid Leave',
                ];
                if (getUserById.staffProfile.englishData.gender === 'Male') {
                    if (getUserById.staffProfile.englishData.maritalStatusEng === 'Married') {
                        takeLeaveType = [
                            'Annual Leave',
                            'Sick Leave',
                            'Alternative Leave',
                            // 'Maternity Leave', 
                            'Paternity Leave',
                            // 'Breastfeeding', 
                            // 'Compassionate(wedding) Leave',
                            'Compassionate(death) Leave',
                            'Unpaid Leave',
                        ]
                    } else if (getUserById.staffProfile.englishData.maritalStatusEng === 'Single') {
                        takeLeaveType = [
                            'Annual Leave',
                            'Sick Leave',
                            'Alternative Leave',
                            // 'Maternity Leave', 
                            'Paternity Leave',
                            // 'Breastfeeding', 
                            'Compassionate(wedding) Leave',
                            'Compassionate(death) Leave',
                            'Unpaid Leave',
                        ]
                    }
                } else if (getUserById.staffProfile.englishData.gender === 'Female') {
                    if (getUserById.staffProfile.englishData.maritalStatusEng === 'Married') {
                        takeLeaveType = [
                            'Annual Leave',
                            'Sick Leave',
                            'Alternative Leave',
                            'Maternity Leave',
                            // 'Paternity Leave',
                            'Breastfeeding',
                            // 'Compassionate(wedding) Leave',
                            'Compassionate(death) Leave',
                            'Unpaid Leave',
                        ]
                    } else if (getUserById.staffProfile.englishData.maritalStatusEng === 'Single') {
                        takeLeaveType = [
                            'Annual Leave',
                            'Sick Leave',
                            'Alternative Leave',
                            'Maternity Leave',
                            // 'Paternity Leave',
                            'Breastfeeding',
                            'Compassionate(wedding) Leave',
                            'Compassionate(death) Leave',
                            'Unpaid Leave',
                        ]
                    }
                }

                return takeLeaveType

            } catch (error) {
                return error
            }
        }
    },
    Mutation: {
        createTakeLeave: async (_, { input }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
    
                if(input.totalLeaveAsDay > input.paymentOfTakeLeaveQuantity.totalRemaining && input.takeLeaveType !== "Unpaid Leave"){
                    return {
                        success: false,
                        message: `Your request is over the remaining ${input.takeLeaveType}. please check and try again.`
                    }
                }
                //@Find request to 
                const requestToId = await getRequestTo(input.createdBy)
                if(requestToId === "contract not found!"){
                    return {
                        success: false,
                        message: "Create request failed. your positions not found, please contact admin."
                    }
                }
                
                const isCreated = await TakeLeave({
                    ...input, 
                    requestTo: requestToId
                }).save();
                console.log(isCreated, "isCreated");
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


                if (input.isAdjust === false) {
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
                        // cc: 'sipou.ssp2018@gmail.com',
                        // bcc: 'sipou.ssp2018@gmail.com',
                        subject: 'Take Leave Request Pending',
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
                        <title>Take Leave Request Pending</title>
                    
                        <style type="text/css">
                            ${pendingStyle()}
                        </style>
                    </head>
                    
                    <body>
                        <div class="div-container">
                        <center class="layout-container">
                            <div class="item-container">
                            <div class="header-image">
                                <div class="title-text">Take Leave Request Pending</div>
                            </div>
                            <div class="item-details">
                    
                                <div class="description">
                                <p>Dear Manager,</p>
                                <p>
                                    <span class="des-name">${requester.staffProfile.englishData.firstNameLatin}</span> is requesting for take leave. please respond by click on this link <a href="https://pepy-hrms-frontend.vercel.app/take-leave">PEPY HRMS</a> 
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
                }

                //@ Action Logs
                if(input.isAdjust === true){
                    await ActionLogs({
                        user: currentUser._id,
                        actionOn: "Take Leave",
                        actionType: "Adjust",
                        docId: isCreated._id
                    }).save()
                }else{                 
                    await ActionLogs({
                        user: currentUser._id,
                        actionOn: "Take Leave",
                        actionType: "Created",
                        docId: isCreated._id
                    }).save()
                }


                return {
                    success: true,
                    message: "Create successfully, thank you !"
                }
            } catch (error) {
                console.log(error, 'error');
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        updateTakeLeave: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isUpdated = await TakeLeave.findByIdAndUpdate(_id, input);
                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                if(input.isAdjust === true){
                    await ActionLogs({
                        user: currentUser._id,
                        actionOn: "Take Leave",
                        actionType: "Updated Adjust",
                        docId: isUpdated._id
                    }).save()
                }else{
                    await ActionLogs({
                        user: currentUser._id,
                        actionOn: "Take Leave",
                        actionType: "Updated",
                        docId: isUpdated._id
                    }).save()
                }

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
        deleteTakeLeave: async (_, { timeOffId }, req) => {

            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const isDeleted = await TakeLeave.findByIdAndDelete(timeOffId);

                if (!isDeleted) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Take Leave",
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
        approveTakeLeave: async (_, { takeLeaveId, userId, managerReply }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const updateStatus = await TakeLeave.findByIdAndUpdate(takeLeaveId, {
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

                const getLastTakeLeaveQty = await TakeLeave.findOne({
                    $and: [
                        { createdBy: { $eq: updateStatus.createdBy } },
                        { takeLeaveType: { $eq: updateStatus.takeLeaveType } }
                    ]
                }).sort({ createdAt: -1 }).limit(1)
                const lastTakeLeaveQty = getLastTakeLeaveQty.paymentOfTakeLeaveQuantity
                //Calculate take leave
                if (lastTakeLeaveQty) {
                    var editPaymentOfTakeLeaveQuantity;
                    if (updateStatus.takeLeaveType === 'Compassionate(death) Leave' || updateStatus.takeLeaveType === 'Unpaid Leave') {
                        editPaymentOfTakeLeaveQuantity = {
                            ...getLastTakeLeaveQty.paymentOfTakeLeaveQuantity,
                            totalUsed: lastTakeLeaveQty.totalUsed + updateStatus.totalLeaveAsDay,
                            // totalRemaining: lastTakeLeaveQty.totalRemaining - updateStatus.totalLeaveAsDay
                        }
                    } else {
                        editPaymentOfTakeLeaveQuantity = {
                            ...getLastTakeLeaveQty.paymentOfTakeLeaveQuantity,
                            totalUsed: lastTakeLeaveQty.totalUsed + updateStatus.totalLeaveAsDay,
                            totalRemaining: lastTakeLeaveQty.totalRemaining - updateStatus.totalLeaveAsDay
                        }
                    }
                    const updateQtyOT = await TakeLeave.findByIdAndUpdate(getLastTakeLeaveQty._id, {
                        paymentOfTakeLeaveQuantity: editPaymentOfTakeLeaveQuantity,
                    })
                } else {
                    return {
                        success: false,
                        message: "Approved Unsuccessful !"
                    }
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
                    // cc: 'sipou.ssp2018@gmail.com',
                    bcc: 'sipou.ssp2018@gmail.com',
                    subject: 'Your Take Leave Approved',
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
                                    <title>Take Leave Approved</title>
                                
                                    <style type="text/css">
                                        ${approvedStyle()}
                                    </style>
                                </head>
                                
                                <body>
                                    <div class="div-container">
                                    <center class="layout-container">
                                        <div class="item-container">
                                        <div class="header-image">
                                            <div class="title-text">Take Leave Approved</div>
                                        </div>
                                        <div class="item-details">
                                
                                            <div class="description">
                                            <p>Dear ${requester.staffProfile.englishData.firstNameLatin},</p>
                                            <p>
                                                Your take leave request has been <span class="des-name">Approved</span>
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
                    actionOn: "Take Leave",
                    actionType: "Approved",
                    docId: takeLeaveId
                }).save()

                return {
                    success: true,
                    message: "Approved successfully"
                }
            } catch (error) {
                console.log(error, 'error');
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer."
                }
            }
        },
        denyTakeLeave: async (_, { takeLeaveId, userId, managerReply }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)

                const updateStatus = await TakeLeave.findByIdAndUpdate(takeLeaveId, {
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

                //Email Alert for Take Leave Denied
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
                    // cc: 'sipou.ssp2018@gmail.com',
                    //bcc: 'sipou.ssp2018@gmail.com',
                    subject: 'Your Take Leave Denied',
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
                                    <title>Take Leave Denied</title>
                                
                                    <style type="text/css">
                                        ${deniedStyle()}
                                    </style>
                                </head>
                                
                                <body>
                                    <div class="div-container">
                                    <center class="layout-container">
                                        <div class="item-container">
                                        <div class="header-image">
                                            <div class="title-text">Take Leave Denied</div>
                                        </div>
                                        <div class="item-details">
                                
                                            <div class="description">
                                            <p>Dear ${requester.staffProfile.englishData.firstNameLatin},</p>
                                            <p>
                                                Your take leave request has been <span class="des-name">Denied</span>
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
                    actionOn: "Take Leave",
                    actionType: "Denied",
                    docId: takeLeaveId
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
export default takeLeaveResolver