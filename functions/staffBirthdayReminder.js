
import nodemailer from 'nodemailer'
import cron from 'node-cron'
import BirthdayReminder from '../models/birthdayReminder.js'
import StaffInfo from '../models/staffInfo.js'
import moment from 'moment'
import { geAllAdminEmail } from './generalFunction.js';

// BirthdayReminder, StaffInfo, Notification



const staffBirthdayReminder = () => {
  try {
    let task = cron.schedule('0 0 8 * * *', async () => {
      console.log("Checking...")

      const currentDate = new Date()
      //To get tomorrow date
      const dateWillCheck = new Date(currentDate)
      dateWillCheck.setDate(dateWillCheck.getDate() + 3)
      //To get the last day in the month of tomorrow 
      const getDaysInCurrentMonth = new Date(dateWillCheck.getFullYear(), dateWillCheck.getMonth() + 1, 0).getDate();

      // console.log("getDaysInCurrentMonth", getDaysInCurrentMonth);

      // console.log("dateWillCheck", dateWillCheck)
      // console.log("dateWillCheckDay", dateWillCheck.getDay() + 3)


      const currentMonthAlert = await BirthdayReminder.aggregate([
        { $match: { month: dateWillCheck.getMonth() + 1 } },
        { $sort: { day: 1 } }
      ]);
      // console.log("currentMonthAlert", currentMonthAlert)
      const nextMonthAlert = await BirthdayReminder.aggregate([
        { $match: { month: dateWillCheck.getMonth() + 2 } },
        { $sort: { day: 1 } }
      ]);
      // console.log("nextMonthAlert", nextMonthAlert)

      const alertDataToday = currentMonthAlert.filter(e => e.day === dateWillCheck.getDate())
      // console.log("alertDataToday", alertDataToday)
      const alertDataBaseCondition = []
      //console.log("alertDataBaseCondition", alertDataBaseCondition)
      const gapDay = 3
      // console.log(currentDate.getDay(), 'currentDate.getDay()');
      if (currentDate.getDay() === 5) {//Friday is a special check, because Saturday & Sunday(day off) we didn't check
        let baseDay1 = 0;
        const findAlertBaseCondition = currentMonthAlert.filter(e => e.day >= dateWillCheck.getDate() && e.day <= dateWillCheck.getDate() + gapDay + 2)// + 2 Meaning we also check for Saturday and Sunday
        // console.log("findAlertBaseCondition", findAlertBaseCondition)
        baseDay1 = findAlertBaseCondition[findAlertBaseCondition.length - 1].day

        if (findAlertBaseCondition.length > 0) {
          currentMonthAlert.map((element, index) => {

            if (element.day >= dateWillCheck.getDate() && element.day <= baseDay1 + gapDay) {
              alertDataBaseCondition.push(element)
              if (element.day > baseDay1) {
                baseDay1 = element.day
              }

            }

          })
        }
      } else {

        if (alertDataToday.length > 0) {
          let baseDay = alertDataToday[0].day
          // console.log("baseDay", baseDay)
          currentMonthAlert.map((element, index) => {

            if (element.day >= dateWillCheck.getDate() && element.day <= baseDay + gapDay) {
              alertDataBaseCondition.push(element)
              baseDay = element.day
            }
          })
        }
      }
      // console.log(alertDataBaseCondition, 'alertDataBaseCondition');

      if (nextMonthAlert.length > 0) {
        if (nextMonthAlert[0].day + getDaysInCurrentMonth - alertDataBaseCondition[alertDataBaseCondition.length - 1] <= gapDay) {
          alertDataBaseCondition.push(nextMonthAlert[0])
          let nextBaseValue = nextMonthAlert[0].day
          nextMonthAlert.map((element, index) => {
            if (element.day > nextBaseValue && element.day <= nextBaseValue + gapDay) {
              alertDataBaseCondition.push(element)
              nextBaseValue = element.day
            }

          })
        }
      }


      //currentMonthAlert.map(e=>console.log(e.day))
      // console.log("alertDataBaseCondition ", alertDataBaseCondition)
      // console.log("length ", alertDataBaseCondition.length)

      //Check existing alert
      const notExistData = []
      alertDataBaseCondition.map((e, i) => {
        const findExisting = e.rounds.filter(e1 => e1 === dateWillCheck.getFullYear())
        console.log("findExisting", findExisting)
        if (findExisting.length === 0) {
          notExistData.push(e)
        }

      });
      // console.log("notExistData", notExistData)

      const usersIdforAlert = notExistData.map(e => e.staffId)
      //console.log("usersIdforAlert", usersIdforAlert)
      const getUsersAlertData = await StaffInfo.find({ _id: { $in: usersIdforAlert } })
      // console.log("getUsersAlertData", getUsersAlertData)
      const getUserAlertName = getUsersAlertData.map(e => e.staffProfile.englishData.firstNameLatin)
      // console.log("getUserAlertName", getUserAlertName)
      // console.log("first:", getUsersAlertData.map(e=>`<li>${e.englishName} (dob: ${e.dateOfBirth})</li>`).join(""))
      let staffNameBirthdayEmail = getUserAlertName.join(', ')
      let listBirthdayEmail = getUsersAlertData.map(e => `<li>${e.staffProfile.englishData.firstNameLatin} on ${moment(e.staffProfile.englishData.dateOfBirthEng).format('Do MMMM')}</li>`).join('')
      // console.log(listBirthdayEmail, 'listBirthdayEmail');



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
      const allAdminEmail = await geAllAdminEmail()
      //email message options
      let mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: allAdminEmail,
        // cc: 'sipou.ssp2018@gmail.com',
        //bcc: 'sipou.ssp2018@gmail.com',
        subject: 'Birthday Upcoming',
        html: `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta http-equiv="X-UA-Compatible" content="IE=edge" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
              />
              <title>Birthday Reminder!</title>
          
              <style type="text/css">
              body {
                margin: 0;
                padding: 0;
              }
          
              .div-container {
                width: 100%;
                background-color: #e6fbef;
                height: fit-content;
                padding: 50px 0px;
              }
          
              .item-container {
                width: 450px;
              }
          
              .item-from {
                color: #198f4a;
                margin-top: 35px;
                font-size: 24px;
              }
          
              .dear-item {
                color: #fff;
              }
          
              .header-image {
                width: 450px;
                background-color: #198f4a;
                padding: 20px 0px;
              }
          
              .image-top {
                color: #fff;
                width: 50px;
                height: 50px;
              }
          
              .item-details {
                background-color: #fff;
                width: 100%;
                height: auto;
                padding: 10px 0px;
              }
          
              .title-text {
                font-size: 20px;
                color: white;
                font-weight: bold;
              }
          
              .header-text {
                margin-top: 16px;
                color: #198f4a;
              }
          
              .description {
                font-size: 16px;
                color: #198f4a;
                padding: 0px 30px 10px 30px;
                text-align: left;
              }
          
              .des-name {
                color: #198f4a;
                font-weight: bold;
              }
          
              .birthday-img {
                width: 250px;
                height: auto;
              }
          
              .footer-title {
                font-size: 16px;
                color: #198f4a;
                text-align: center;
              }
          
              .footer {
                padding-top: 5px;
                color: #198f4a;
                text-align: center;
              }
          
          
              @media only screen and (max-width: 600px) {
                .header-image {
                  width: 275px;
                  padding: 12px 0px;
                }
          
                .item-container {
                  width: 275px;
                }
          
                .title-text {
                  font-size: 14px;
                  color: white;
                  font-weight: bold;
                }
          
                .description {
                  font-size: 12px;
                  padding: 0px 18px 10px 18px;
                }
          
                .birthday-img {
                  width: 160px;
                }
          
                .footer-title {
                  font-size: 12px;
                }
          
                .footer {
                  padding-top: 0px;
                  font-size: 10px;
                }
          
              }
            </style>
            </head>
          
            <body>
              <div class="div-container">
                <center class="layout-container">
                  <div class="item-container">
                    <div class="header-image">
                      <div class="title-text">Birthday Reminder!</div>
                    </div>
                    <div class="item-details">
          
                      <div class="description">
                        <p>Dear HR Manager,</p>
                        <p>
                          The Birthday of <span class="des-name">${staffNameBirthdayEmail}</span> will come on soon :
                        </p>
                        <p>
                          <ul>
                            ${listBirthdayEmail}
                          </ul>
                        </p>
                        <p>Kind Regards,</p>
                      </div>
                      <div class="img-container">
                        <img
                          class="birthday-img"
                          src="https://firebasestorage.googleapis.com/v0/b/summer-marker-327504.appspot.com/o/images%2Fundraw_Birthday_cake_re_bsw5.png?alt=media&token=9c11353b-e571-4183-89f1-dfa9de6e9484"
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



      if (getUserAlertName.length > 0) {

        if (currentDate.getDay() !== 6 && currentDate.getDay() !== 0) {

          //send email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error)
            } else {
              console.log('Email send: ' + info.response)
            }
          });

          // const createNotification = new Notification({
          //     type: "birthday",
          //     title: "Birthday Upcoming",
          //     text: `The Birthday of ${getUserAlertName.join(', ')}, will come on soon.`
          // })
          // await createNotification.save();

          // //console.log("createNotification", createNotification)

          // pubsub.publish('NOTIFICATION', {
          //     BirthdayReminderNotification: createNotification
          // });

          //Update birthday alert round field to make sure alert is not exist 
          notExistData.map(async e => {
            const updateRounds = e.rounds
            const year = dateWillCheck.getFullYear()
            updateRounds.push(year)
            const updateBirthdayReminder = await BirthdayReminder.findByIdAndUpdate(e._id, {
              rounds: updateRounds
            })
          })
        }
      }
    }
    );

    //task.stop();
  } catch (error) {
    console.log("Birthday Reminder Error::", error.message);
  }
}



export default staffBirthdayReminder

// module.exports = autoSendEmail



