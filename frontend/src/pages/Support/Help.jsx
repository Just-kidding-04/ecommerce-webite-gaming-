import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FaQuestionCircle, FaShoppingCart, FaTruck, FaUndo, FaCreditCard,
  FaUserCircle, FaShieldAlt, FaChevronDown, FaChevronUp, FaSearch,
  FaHeadset, FaBook, FaGamepad, FaLaptop, FaHeadphones
} from 'react-icons/fa'

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: FaBook },
    { id: 'orders', name: 'Orders', icon: FaShoppingCart },
    { id: 'shipping', name: 'Shipping', icon: FaTruck },
    { id: 'returns', name: 'Returns', icon: FaUndo },
    { id: 'payments', name: 'Payments', icon: FaCreditCard },
    { id: 'account', name: 'Account', icon: FaUserCircle },
  ]

  const faqs = [
    {
      category: 'orders',
      question: 'How do I track my order?',
      answer: 'You can track your order by going to "My Orders" in your account dashboard. Click on any order to see its current status and tracking details. You\'ll also receive email updates at each stage of delivery.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placing them. After that, the order enters processing and cannot be changed. Go to "My Orders", select the order, and click "Cancel Order" if the option is available.'
    },
    {
      category: 'orders',
      question: 'What if I receive a damaged product?',
      answer: 'We\'re sorry if you received a damaged item! Please contact us within 48 hours of delivery with photos of the damage. We\'ll arrange a free replacement or full refund. Go to Contact Us or call our 24/7 helpline.'
    },
    {
      category: 'shipping',
      question: 'What are the shipping charges?',
      answer: 'We offer FREE shipping on all orders above ₹500. For orders below ₹500, a flat shipping fee of ₹49 applies. Express delivery is available at ₹99 extra for most locations.'
    },
    {
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-5 business days for metro cities and 5-7 days for other locations. Express delivery is 1-2 business days for select pin codes. You can check estimated delivery at checkout.'
    },
    {
      category: 'shipping',
      question: 'Do you deliver to my location?',
      answer: 'We deliver across India to 25,000+ pin codes. Enter your pin code at checkout to verify delivery availability and see estimated delivery dates for your location.'
    },
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 7-day easy return policy for most products. Items must be unused, in original packaging with all tags intact. Some products like earphones and personal gaming accessories are non-returnable for hygiene reasons.'
    },
    {
      category: 'returns',
      question: 'How do I initiate a return?',
      answer: 'Go to "My Orders", select the order containing the item you want to return, and click "Return Item". Choose a reason, and our pickup partner will collect the item within 2-3 business days.'
    },
    {
      category: 'returns',
      question: 'When will I receive my refund?',
      answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned item. The amount will be credited to your original payment method or Gaming Store wallet.'
    },
    {
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods: Credit/Debit Cards (Visa, MasterCard, RuPay), UPI, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery for orders up to ₹50,000.'
    },
    {
      category: 'payments',
      question: 'Is it safe to save my card details?',
      answer: 'Yes! We use industry-standard encryption and are PCI-DSS compliant. Your card details are tokenized and never stored on our servers. You can manage saved cards in Account Settings.'
    },
    {
      category: 'payments',
      question: 'Why was my payment declined?',
      answer: 'Payments may fail due to: incorrect card details, insufficient funds, bank security blocks, or network issues. Try again or use a different payment method. Contact your bank if the issue persists.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your registered email, and we\'ll send a reset link. The link expires in 24 hours. You can also change your password from Account Settings while logged in.'
    },
    {
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile page by clicking on your name in the top right. You can update your name, phone number, email, and manage your saved addresses from there.'
    },
    {
      category: 'account',
      question: 'How do I delete my account?',
      answer: 'We\'re sad to see you go! To delete your account, go to Account Settings and scroll to "Delete Account". Note that this action is irreversible and all your data, order history, and rewards will be permanently removed.'
    },
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const popularTopics = [
    { icon: FaGamepad, title: 'Gaming PCs', desc: 'Setup guides & compatibility' },
    { icon: FaLaptop, title: 'Laptops', desc: 'Warranty & repairs' },
    { icon: FaHeadphones, title: 'Audio', desc: 'Pairing & troubleshooting' },
    { icon: FaShieldAlt, title: 'Warranty', desc: 'Claims & coverage' },
  ]

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-4">
            <FaQuestionCircle className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Help Center</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Find answers to common questions or reach out to our support team
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for help articles..."
            className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition text-lg"
          />
        </div>

        {/* Popular Topics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {popularTopics.map((topic, idx) => (
            <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition cursor-pointer text-center">
              <topic.icon className="text-2xl text-purple-400 mx-auto mb-2" />
              <h3 className="text-white font-medium text-sm">{topic.title}</h3>
              <p className="text-gray-500 text-xs">{topic.desc}</p>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
            >
              <cat.icon />
              {cat.name}
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl overflow-hidden mb-10">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm">{filteredFaqs.length} articles found</p>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="divide-y divide-gray-700/50">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="hover:bg-gray-800/50 transition">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="text-white font-medium pr-4">{faq.question}</span>
                    {openFaq === idx ? (
                      <FaChevronUp className="text-purple-400 flex-shrink-0" />
                    ) : (
                      <FaChevronDown className="text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FaQuestionCircle className="text-4xl text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No articles found matching your search</p>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 text-center">
          <FaHeadset className="text-4xl text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Still Need Help?</h2>
          <p className="text-gray-400 mb-6">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Contact Support
            </Link>
            <a
              href="tel:1800GAMING99"
              className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition"
            >
              Call 1800-GAMING-99
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
