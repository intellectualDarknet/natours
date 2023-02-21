const nodemailer = require('nodemailer');
const pug = require('pug')
const htmlToText = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    // user -who we want to send and url -where
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    // configure email address in env
    this.from = `Jonas some fellow <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    //differs in prod and dev
    if (process.env.NODE_ENV === 'production') {
      //  just skip for now
      return 1 
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  async send(template, subject) {
    // 1) Render HTML bbased on a pug template
    // we dont want to actually render but to create
    // html so we can send this html as emai
    // we can pass data to the pug file
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url
    })

    // 2) Define email options

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // we need a way of converting html into simple text so
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family!')
  }
}
