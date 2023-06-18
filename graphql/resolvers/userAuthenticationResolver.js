import nodemailer from 'nodemailer'
import pkg from 'bcryptjs';
const { hash, compare } = pkg;
import otpGenerator from 'otp-generator'
import { GraphQLError } from "graphql";
import StaffInfo from "../../models/staffInfo.js"
import OneTimePassword from '../../models/oneTimePassword.js'
import { issueAuthToken, verifyUser } from '../../helpers/userAuthentication.js'
import ActionLogs from '../../models/actionLogs.js';
import * as dotenv from 'dotenv'
dotenv.config()


const userAuthenticationResolver = {
    Mutation: {
        loginUser: async (_, { emailAddress, password }, req) => {
            try {
                console.log(emailAddress, "emailAddress");
                console.log(password, "password");
                const getUser = await StaffInfo.findOne({ 'systemAccessData.emailAddress': emailAddress })
                if (!getUser) {
                    return {
                        success: false,
                        message: "Invalid Credentials !"
                    }
                }
                const isMatch = await compare(password, getUser.systemAccessData.password);
                if (!isMatch) {
                    return {
                        success: false,
                        message: "Incorrect Password !"
                    }
                }
                const token = issueAuthToken({
                    _id: getUser._id,
                    emailAddress: getUser.systemAccessData.emailAddress,
                    role: getUser.systemAccessData.role,
                    firstNameLatin: getUser.staffProfile.englishData.firstNameLatin,
                    lastNameLatin: getUser.staffProfile.englishData.lastNameLatin
                })

                if (password === "2023@Pepy") {
                    return {
                        success: true,
                        message: "You're Welcome, Please reset your new password.",
                        token: token,
                        user: getUser,
                    }
                }

                //@ Action Logs
                await ActionLogs({
                    user: getUser._id,
                    actionOn: "System",
                    actionType: "Login",
                    docId: null
                }).save()

                return {
                    success: true,
                    message: "Login Successfully",
                    token: token,
                    user: getUser,
                }

            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        generateOTP: async (_id, { emailAddress }, req) => {
            // await verifyUser(req)
            try {
                console.log(emailAddress, "emailAddress");
                //Check this email is has in system
                const getUserByEmail = await StaffInfo.findOne({ 'systemAccessData.emailAddress': emailAddress })
                if (!getUserByEmail) {
                    return {
                        success: false,
                        message: `${emailAddress} is not found in system!` //+ error.message
                    }
                }
                //Function for add minutes
                function addMinutes(date, minutes) {
                    date.setMinutes(date.getMinutes() + minutes);
                    return date;
                }

                const expireAt = addMinutes(new Date(), 5)

                const getOTP = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })

                const createOTP = await OneTimePassword({ otp: getOTP, expireAt }).save()

                if (createOTP) {
                    //email transport configuration
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
                        from: 'noreply.pepy.hrms@gmail.com',
                        to: emailAddress,
                        // cc: 'sipou.ssp2018@gmail.com',
                        //bcc: 'phearom.ssp2018@gmail.com',
                        subject: 'Password Recovery OTP',
                        html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8" />
                            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                            <title>Password Recovery OTP</title>
                            <style type="text/css">
                            body {
                            margin: 0;
                            padding: 0;
                            }
                        </style>
                        </head>
                        
                        <body>
                            <div> Dear ${getUserByEmail.staffProfile.englishData.firstNameLatin},</div>
                            <br>
                            <div>Your password recovery OTP is <b>${createOTP.otp}</b>. Verify and recover your password.</div>
                            <br>
                            <div>Yours truly,</div>
                            <div>PEPY Human Resource Management System</div>

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
                // console.log(createOTP, "createOTP")
                return {
                    success: true,
                    message: 'OTP have been sent to your email address!'
                }
            } catch (error) {
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }

        },
        verifyOTP: async (_, { otp }, req) => {
            try {

                const currentDate = new Date()
                const verifyOTP = await OneTimePassword.findOne({
                    $and: [
                        { otp: { $eq: otp } },
                        { expireAt: { $gt: currentDate } }
                    ]
                })
                if (!verifyOTP) {
                    return {
                        success: false,
                        message: 'Invalid OTP'
                    }
                }
                //Clear/remove expire otp from database 
                await OneTimePassword.deleteMany({ expireAt: { $lte: currentDate } })
                return {
                    success: true,
                    message: 'OTP Verified Successfully'
                }
            } catch (error) {
                console.log(error.message)
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        resetPassword: async (_, { emailAddress, password }, req) => {
            try {
   
                const getUser = await StaffInfo.findOne({ 'systemAccessData.emailAddress': emailAddress })
              
                if (!getUser) {
                    return {
                        success: false,
                        message: `${emailAddress} is not found in system!`
                    }
                }
                const hashPassword = await hash(password, 9)
                const systemAccessData = {
                    ...getUser.systemAccessData,
                    // emailAddress: emailAddress,
                    password: hashPassword,
                }
              
                const updateSystemAccessData = await StaffInfo.findByIdAndUpdate(getUser._id, { systemAccessData: systemAccessData })
                // console.log(updateSystemAccessData, 'updateSystemAccessData')
                if (!updateSystemAccessData) {
                    return {
                        success: false,
                        message: "Reset password failed !"
                    }
                }

                //@ Action Logs
                // await ActionLogs({
                //     user: currentUser._id,
                //     actionOn: "Staff Information",
                //     actionType: "Reset Password",
                //     docId: null
                // }).save()

                return {
                    success: true,
                    message: "Reset password successfully"
                }

            } catch (error) {
                console.log(error, "error");
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
        updateUser: async (_, { input, _id }, req) => {
            try {
                //@User Authentication
                const currentUser = await verifyUser(req)
             
                const findStaffId = await StaffInfo.findById(_id);
                if (!findStaffId) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }
                const systemAccessDataUpdate = { ...input.systemAccessData, password: findStaffId.systemAccessData.password }

                const isUpdated = await StaffInfo.findByIdAndUpdate(_id, {
                    ...input,
                    systemAccessData: systemAccessDataUpdate
                });

                if (!isUpdated) {
                    return {
                        success: false,
                        message: "Unsuccessful, please try again !"
                    }
                }


                //@ Action Logs
                await ActionLogs({
                    user: currentUser._id,
                    actionOn: "Update User",
                    actionType: "Updated",
                    docId: _id
                }).save()

                return {
                    success: true,
                    message: "Update successfully, thank you !"
                }
            } catch (error) {
                console.log(error, 'update User');
                return {
                    success: false,
                    message: "Error occurred, please contact to software developer." //+ error.message
                }
            }
        },
    }
}
export default userAuthenticationResolver;