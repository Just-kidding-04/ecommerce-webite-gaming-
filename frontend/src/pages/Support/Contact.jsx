import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaHeadset, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaPaperPlane, FaQuestionCircle, FaComments, FaTwitter,
  FaFacebook, FaInstagram, FaDiscord
} from 'react-icons/fa'
import { toast } from '../../utils/toast'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject || 'N/A'}\nOrder: ${formData.orderNumber || 'N/A'}\n\n${formData.message}`
        })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Message sent! We\'ll get back to you soon.')
        setFormData({ name: '', email: '', subject: '', orderNumber: '', message: '' })
      } else {
        toast.error(data.error || 'Failed to send message')
      }
    } catch (err) {
      toast.error('Network error. Please try again.')
    }
    setLoading(false)
  }

  const contactMethods = [
    { icon: FaPhone, title: 'Phone Support', value: '1800-GAMING-99', subtext: 'Toll-free, 24/7', color: 'from-green-600 to-emerald-600' },
    { icon: FaEnvelope, title: 'Email Us', value: 'support@gamingstore.com', subtext: 'Response within 24hrs', color: 'from-blue-600 to-cyan-600' },
    { icon: FaComments, title: 'Live Chat', value: 'Start Chat', subtext: 'Available 9AM-9PM', color: 'from-blue-600 to-purple-600' },
  ]

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <FaHeadset className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">How Can We Help?</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our gaming support team is here 24/7 to assist you with any questions, issues, or feedback.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <Link to="/help" className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-6 py-3 rounded-xl transition">
            <FaQuestionCircle className="text-purple-400" />
            FAQs & Help Center
          </Link>
          <Link to="/orders" className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 px-6 py-3 rounded-xl transition">
            <FaClock className="text-blue-400" />
            Track Your Order
          </Link>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 text-center hover:border-purple-500/50 transition">
              <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${method.color} rounded-xl mb-4`}>
                <method.icon className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">{method.title}</h3>
              <p className="text-purple-400 font-medium mb-1">{method.value}</p>
              <p className="text-gray-500 text-sm">{method.subtext}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaPaperPlane className="text-purple-400" />
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="">Select a topic</option>
                    <option value="order">Order Issue</option>
                    <option value="return">Returns & Refunds</option>
                    <option value="product">Product Question</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Order Number (if applicable)</label>
                  <input
                    type="text"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleChange}
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                    placeholder="#ORD-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Your Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Hours */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaClock className="text-purple-400" />
                Support Hours
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone Support</span>
                  <span className="text-green-400">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Live Chat</span>
                  <span className="text-white">9AM - 9PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email Response</span>
                  <span className="text-white">Within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Office Address */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-purple-400" />
                Our Office
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Gaming Store Pvt. Ltd.<br />
                1234 Gamer Lane,<br />
                Pixel City, PC 56789<br />
                United States
              </p>
            </div>

            {/* Social Media */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Connect With Us</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                  <FaTwitter />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-blue-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                  <FaFacebook />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-pink-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                  <FaInstagram />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-700 hover:bg-indigo-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition">
                  <FaDiscord />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
