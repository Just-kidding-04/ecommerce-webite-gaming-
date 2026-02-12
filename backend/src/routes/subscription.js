const express = require('express')
const router = express.Router()
const { sendMail } = require('../utils/email')

router.post('/', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' })
    }

    try {
        // Send welcome email
        await sendMail({
            to: email,
            subject: 'Welcome to GamingStore Community!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #4F46E5;">Welcome to GamingStore! 🎮</h1>
          <p>Hi there,</p>
          <p>Thanks for subscribing to our newsletter! We're thrilled to have you in our community.</p>
          <p>You'll be the first to know about:</p>
          <ul>
            <li>🔥 Exclusive flash deals</li>
            <li>🚀 New product launches</li>
            <li>💡 Pro gaming tips and tricks</li>
          </ul>
          <p>Stay tuned for our next update!</p>
          <p>Best regards,<br/>The GamingStore Team</p>
        </div>
      `
        })

        res.json({ success: true, message: 'Successfully subscribed!' })
    } catch (error) {
        console.error('Subscription error:', error)
        res.status(500).json({ success: false, message: 'Failed to subscribe. Please try again later.' })
    }
})

module.exports = router
