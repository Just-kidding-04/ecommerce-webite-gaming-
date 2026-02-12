const { Sequelize } = require('sequelize');
const { Product, Category, User, Specification, Coupon, Order, OrderItem, CartItem, Address, Wishlist, Image } = require('./src/models');
const { laptops, mobiles, accessories, gamingPCs, audio, monitors } = require('./src/seedData');
const bcrypt = require('bcrypt');

async function seed() {
    console.log('Starting Database Seed...');

    try {
        // Warning: This will wipe the database
        console.log('Syncing database (FORCE: TRUE)...');
        // We need to require sequelize instance from models to ensure we use the same connection
        const { sequelize } = require('./src/models');
        await sequelize.sync({ force: true });
        console.log('Database cleared.');

        // 1. Create Users (Admin & Sellers)
        console.log('Creating Users...');
        const adminHash = await bcrypt.hash('adminpass', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            passwordHash: adminHash,
            role: 'admin'
        });

        const sellers = [];
        const sellerNames = ['TechGiant', 'GadgetWorld', 'ProGamers', 'ElectroHub', 'BestDeals'];
        const sellerHash = await bcrypt.hash('sellerpass', 10);

        for (const sName of sellerNames) {
            const seller = await User.create({
                name: sName,
                email: `${sName.toLowerCase()}@example.com`,
                passwordHash: sellerHash,
                role: 'seller',
                businessName: `${sName} LLC`,
                sellerVerified: true
            });
            sellers.push(seller);
        }

        const getRandomSellerId = () => sellers[Math.floor(Math.random() * sellers.length)].id;

        // 2. Create Categories & Products
        const categoriesData = [
            { name: 'Laptops', desc: 'High performance gaming laptops', items: laptops },
            { name: 'Mobiles', desc: 'Latest smartphones for gaming', items: mobiles },
            { name: 'Accessories', desc: 'Peripherals and gaming gear', items: accessories },
            { name: 'Gaming PC', desc: 'Powerful pre-built desktops', items: gamingPCs },
            { name: 'Audio', desc: 'Immersive headphones and speakers', items: audio },
            { name: 'Monitors', desc: 'High refresh rate displays', items: monitors }
        ];

        for (const catData of categoriesData) {
            console.log(`Seeding Category: ${catData.name}...`);
            const category = await Category.create({
                name: catData.name,
                description: catData.desc,
                image: `https://placehold.co/400x400/101827/a78bfa?text=${catData.name}`
            });

            for (const item of catData.items) {
                const product = await Product.create({
                    name: item.name,
                    short: item.short,
                    price: item.price,
                    originalPrice: Math.round(item.price * 1.2), // 20% markup for original price
                    image: item.image,
                    description: item.description,
                    features: item.features,
                    stock: Math.floor(Math.random() * 50) + 5,
                    categoryId: category.id,
                    sellerId: getRandomSellerId(),
                    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 to 5.0
                    reviewCount: Math.floor(Math.random() * 500)
                });

                if (item.specs) {
                    for (const [key, val] of Object.entries(item.specs)) {
                        await Specification.create({
                            key,
                            value: val,
                            ProductId: product.id
                        });
                    }
                }
            }
        }

        // 3. Create Coupon (GAMING10)
        console.log('Creating Coupon...');
        await Coupon.create({
            code: 'GAMING10',
            discountType: 'percentage',
            discountValue: 10,
            minPurchase: 50,
            expiryDate: new Date(Date.now() + 86400000 * 30), // 30 days
            isActive: true
        });

        console.log('Creating Coupon...');
        await Coupon.create({
            code: 'GAMING200',
            discountType: 'fixed',
            discountValue: 200,
            minPurchase: 1000,
            expiryDate: new Date(Date.now() + 86400000 * 30), // 30 days
            isActive: true
        });
        console.log('Seeding Complete! Database is populated with 180 products.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
