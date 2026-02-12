const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')

const { sequelize, Product, Category, Specification, User } = require('./src/models')
const products = require('./src/routes/products')
const auth = require('./src/routes/auth')
const order = require('./src/routes/order')
const cart = require('./src/routes/cart')
const wishlist = require('./src/routes/wishlist')
const address = require('./src/routes/address')
const user = require('./src/routes/user')
const upload = require('./src/routes/upload')
const seller = require('./src/routes/seller')
const subscription = require('./src/routes/subscription')
const contact = require('./src/routes/contact')

const app = express()
app.use(cors())
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// serve uploaded/static images
app.use('/public', express.static(path.join(__dirname, 'public')))

app.use('/api/products', products)
app.use('/api/auth', auth)
app.use('/api/orders', order)
app.use('/api/cart', cart)
app.use('/api/wishlist', wishlist)
app.use('/api/addresses', address)
app.use('/api/users', user)
app.use('/api/upload', upload)
app.use('/api/seller', seller)

app.use('/api/subscription', subscription)
app.use('/api/contact', contact)

app.get('/', (req, res) => res.json({ ok: true, message: 'GamingStore API' }))

const port = process.env.PORT || 4000

async function start() {
	try {
		await sequelize.authenticate()
		await sequelize.sync({ alter: true })




		// create demo admin user if not exists
		const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } })
		if (!existingAdmin) {
			const bcrypt = require('bcrypt')
			const hash = await bcrypt.hash('adminpass', 10)
			await User.create({ name: 'Admin', email: 'admin@example.com', passwordHash: hash, role: 'admin' })
			console.log('Created demo admin: admin@example.com / adminpass')
		} else if (existingAdmin.role !== 'admin') {
			// Update existing admin to have admin role if they don't already
			await existingAdmin.update({ role: 'admin' })
			console.log('Updated existing admin user to admin role')
		}

		// Clean up orphan addresses (addresses with userId that doesn't exist)
		const { Address, Wishlist, CartItem, Order } = require('./src/models')
		try {
			const allUsers = await User.findAll({ attributes: ['id'] })
			const validUserIds = allUsers.map(u => u.id)

			if (validUserIds.length > 0) {
				// Delete orphan addresses
				const deletedAddresses = await Address.destroy({
					where: {
						userId: {
							[require('sequelize').Op.notIn]: validUserIds
						}
					}
				})
				if (deletedAddresses > 0) console.log(`Cleaned up ${deletedAddresses} orphan addresses`)

				// Delete orphan wishlist items
				const deletedWishlist = await Wishlist.destroy({
					where: {
						userId: {
							[require('sequelize').Op.notIn]: validUserIds
						}
					}
				})
				if (deletedWishlist > 0) console.log(`Cleaned up ${deletedWishlist} orphan wishlist items`)

				// Delete orphan cart items
				const deletedCart = await CartItem.destroy({
					where: {
						userId: {
							[require('sequelize').Op.notIn]: validUserIds
						}
					}
				})
				if (deletedCart > 0) console.log(`Cleaned up ${deletedCart} orphan cart items`)
			}
		} catch (cleanupErr) {
			console.log('Cleanup skipped:', cleanupErr.message)
		}

		app.listen(port, () => console.log('Backend running on', port))
	} catch (e) {
		console.error('Failed to start server', e)
	}
}

start()
