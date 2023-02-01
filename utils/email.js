const nodemailer = require('nodemailer');

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'Jonas some fellow <trash@smash.io>',
    to: options.email,
    subject: options.subject,
    email: options.email,
    text: options.message
  };

  await transporter.sendMail(mailOptions);
};

// smth like server
// 1) create a transporter

// service: 'Gmail',
// auth: {
//   user: process.env.EMAIL_USERNAME,
//   password: process.env.EMAIL_PASSWORD
// }

// Activate in gmail "less secure app" option
// Gmail only allows 500 messages per day and surely u ll be banned as spammer
// lets fake mails Mailtrap

module.exports = sendEmail;
