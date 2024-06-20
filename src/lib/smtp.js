const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'support@vehtechs.com',
    pass: 'Test@1234'
  }
});

module.exports = { transporter };