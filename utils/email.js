const nodemailer = require('nodemailer')

const sendEmail = async options => {
    // 1) Create a transporter which sends mail
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: 'Piyush Khurana <piyush.3716403221@ipu.ac.in>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        //html:
    };

    // 3) actually send the message
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;