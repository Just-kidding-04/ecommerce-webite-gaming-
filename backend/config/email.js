// Email configuration for nodemailer (or similar)
module.exports = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Always use the authenticated user as the sender
  get from() {
    return this.auth.user;
  }
}
