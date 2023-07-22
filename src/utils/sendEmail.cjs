const nodeMailer = require('nodemailer');


const sendEmail = async (options) => {

    const transporter = await nodeMailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }

    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
 
  await  transporter.sendMail(mailOptions);
    console.log("called")

}


module.exports = sendEmail;