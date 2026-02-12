const express = require('express');
const router = express.Router();
const { sendMail } = require('../utils/email');

// POST /contact - send contact us email
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  try {
    await sendMail({
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Us Message from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br>${message}</p>`,
      from: email
    });
    res.json({ success: true, message: 'Your message has been sent.' });
  } catch (err) {
    console.error('Contact email error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

module.exports = router;
