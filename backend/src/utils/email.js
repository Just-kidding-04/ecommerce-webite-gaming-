
const nodemailer = require('nodemailer')
const config = require('../../config/email')

function sendMail({ to, subject, html, text, from, smtpUser, smtpPass }) {

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: smtpUser || config.auth.user,
      pass: smtpPass || config.auth.pass
    }
  })
  return transporter.sendMail({
    from: from || config.from,
    to,
    subject,
    html,
    text
  })
}

module.exports = { sendMail }
