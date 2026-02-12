const categories = [
    'Laptops',
    'Mobiles',
    'Accessories',
    'Gaming PC',
    'Audio',
    'Monitors'
];

const brands = {
    'Laptops': ['Alienware', 'ASUS ROG', 'MSI', 'Razer', 'HP Omen', 'Lenovo Legion', 'Acer Predator'],
    'Mobiles': ['ASUS ROG Phone', 'RedMagic', 'Black Shark', 'Samsung Galaxy', 'Apple iPhone', 'OnePlus'],
    'Accessories': ['Logitech', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'ASUS'],
    'Gaming PC': ['Alienware', 'HP Omen', 'Corsair', 'NZXT', 'CyberPowerPC', 'MSI'],
    'Audio': ['Sony', 'Bose', 'Sennheiser', 'Razer', 'HyperX', 'SteelSeries'],
    'Monitors': ['Samsung Odyssey', 'LG UltraGear', 'ASUS ROG', 'Alienware', 'Acer Predator', 'BenQ']
};

const adjectives = ['Pro', 'Elite', 'Ultra', 'Max', 'Extreme', 'Prime', 'Core', 'V2', 'V3', 'X', 'S'];

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Generate features based on category
const getFeatures = (category) => {
    const baseFeatures = {
        'Laptops': [
            'NVIDIA GeForce RTX 4090 16GB GDDR6',
            'Intel Core i9-14900HX Processor',
            '32GB DDR5 5600MHz RAM',
            '2TB NVMe SSD Gen4',
            '16" QHD+ 240Hz Mini-LED Display',
            'Cherry MX Mechanical Keyboard',
            'Vapor Chamber Cooling',
            'Wi-Fi 7 & Bluetooth 5.4'
        ],
        'Mobiles': [
            'Snapdragon 8 Gen 3 Processor',
            '16GB LPDDR5X RAM',
            '6.8" AMOLED 165Hz Display',
            '6000mAh Battery with 65W Charging',
            'AirTrigger Ultrasonic Buttons',
            'AeroActive Cooler Compatible',
            '50MP IMX890 Main Camera',
            'Dual Front-Facing Stereo Speakers'
        ],
        'Accessories': [
            'Lag-free 2.4GHz Wireless Connection',
            '25K High Precision Sensor',
            'Lightweight 60g Design',
            '70 Hours Battery Life',
            'PTFE Glide Feet',
            'On-board Memory Profiles',
            'Razer Chroma RGB / Lightsync RGB',
            'Optical Switches Gen-3'
        ],
        'Gaming PC': [
            'Liquid Cooled CPU & GPU',
            'NVIDIA GeForce RTX 4080 Super',
            'AMD Ryzen 9 7950X3D',
            '64GB DDR5 6000MHz RGB RAM',
            '4TB NVMe SSD + 8TB HDD',
            '1000W 80+ Platinum PSU',
            'Custom Sleeved Cables',
            'High Airflow Mesh Case'
        ],
        'Audio': [
            'Active Noise Cancellation (ANC)',
            'Lossless 2.4GHz Wireless',
            '50mm Titanium Drivers',
            'ClearCast Gen 2 Mic',
            'Hot-swappable Battery System',
            'Simultaneous Bluetooth Mixing',
            'Spatial Audio Support',
            'Premium Memory Foam Earcups'
        ],
        'Monitors': [
            '4K UHD (3840 x 2160) OLED Panel',
            '240Hz Refresh Rate',
            '0.03ms GtG Response Time',
            'NVIDIA G-SYNC Compatible',
            '99% DCI-P3 Color Gamut',
            'HDMI 2.1 & DisplayPort 1.4',
            'KVM Switch Built-in',
            'HDR True Black 400'
        ]
    };

    // Randomize and pick 6-8 features
    const pool = baseFeatures[category] || baseFeatures['Accessories'];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    // Add some random variety to specific specs
    return shuffled.map(f => {
        if (f.includes('RAM')) return f.replace('32GB', getRandom(['16GB', '32GB', '64GB']));
        if (f.includes('SSD')) return f.replace('2TB', getRandom(['1TB', '2TB', '4TB']));
        return f;
    });
};

const getImageUrl = (category, index) => {
    const keywords = {
        'Laptops': 'gaming,laptop',
        'Mobiles': 'smartphone,technology',
        'Accessories': 'gaming,mouse,keyboard',
        'Gaming PC': 'gaming,computer,desktop',
        'Audio': 'headphones,audio',
        'Monitors': 'monitor,screen,display'
    };

    // Use a deterministic random seed/lock based on category and index to ensure 
    // the same product always gets the same unique image, but different products get different images.
    const keyword = keywords[category] || 'technology';
    // ?lock= ensures uniqueness per item index
    return `https://loremflickr.com/600/400/${keyword}?lock=${index + (Object.keys(keywords).indexOf(category) * 100)}`;
};

const getPrice = (category) => {
    const ranges = {
        'Laptops': [40000, 250000],
        'Mobiles': [10000, 120000],
        'Accessories': [500, 15000],
        'Gaming PC': [60000, 400000],
        'Audio': [1000, 30000],
        'Monitors': [8000, 80000]
    };
    const [min, max] = ranges[category] || [1000, 10000];
    // Round to nearest 99 or 00 for aesthetics
    const price = Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.floor(price / 100) * 100 + 99;
};

const generateProducts = () => {
    const allProducts = {};

    categories.forEach((cat, catIndex) => {
        const products = [];
        for (let i = 1; i <= 30; i++) {
            const brand = getRandom(brands[cat]);
            const model = `${brand} ${getRandom(adjectives)} ${i + Math.floor(Math.random() * 100)}`;

            const price = getPrice(cat);
            const originalPrice = Math.floor(price * (1.1 + Math.random() * 0.2)); // 10-30% markup

            // Detailed Specs Generation
            const getSpecs = (category, brand, model) => {
                const baseSpecs = {
                    'Brand': brand,
                    'Model': model,
                    'Warranty': '2 Years',
                    'Condition': 'New'
                };

                const extraSpecs = {
                    'Laptops': {
                        'Processor': getRandom(['Intel Core i9-14900HX', 'Intel Core i7-13700H', 'AMD Ryzen 9 7945HX', 'AMD Ryzen 7 7840HS']),
                        'RAM': getRandom(['16GB DDR5', '32GB DDR5', '64GB DDR5']),
                        'Storage': getRandom(['1TB NVMe SSD', '2TB NVMe SSD', '4TB NVMe SSD']),
                        'Graphics': getRandom(['NVIDIA RTX 4090 16GB', 'NVIDIA RTX 4080 12GB', 'NVIDIA RTX 4070 8GB']),
                        'Display': getRandom(['16" QHD+ 240Hz', '18" 4K Mini-LED', '15.6" FHD 360Hz']),
                        'OS': 'Windows 11 Pro'
                    },
                    'Mobiles': {
                        'Processor': getRandom(['Snapdragon 8 Gen 3', 'Apple A17 Pro', 'Dimensity 9300']),
                        'RAM': getRandom(['12GB', '16GB', '24GB']),
                        'Storage': getRandom(['256GB', '512GB', '1TB']),
                        'Screen': getRandom(['6.8" AMOLED 120Hz', '6.7" Super Retina XDR']),
                        'Battery': getRandom(['5000mAh', '5500mAh', '6000mAh']),
                        'Camera': getRandom(['200MP Main', '50MP Triple Setup', '108MP Pro Grade'])
                    },
                    'Gaming PC': {
                        'CPU': getRandom(['Intel Core i9-14900K', 'AMD Ryzen 9 7950X3D']),
                        'GPU': getRandom(['NVIDIA RTX 4090', 'NVIDIA RTX 4080 Super', 'AMD RX 7900 XTX']),
                        'Motherboard': getRandom(['Z790 Maximus', 'X670E Aorus Master']),
                        'Cooling': getRandom(['360mm AIO Liquid', 'Custom Water Loop']),
                        'Case': getRandom(['Lian Li O11 Dynamic', 'Corsair 5000D', 'Hyte Y60']),
                        'PSU': getRandom(['1000W 80+ Platinum', '1200W 80+ Titanium'])
                    },
                    'Monitors': {
                        'Panel Type': getRandom(['OLED', 'IPS', 'Mini-LED', 'VA']),
                        'Resolution': getRandom(['4K UHD (3840x2160)', 'QHD (2560x1440)', 'UWQHD (3440x1440)']),
                        'Refresh Rate': getRandom(['240Hz', '144Hz', '360Hz', '175Hz']),
                        'Response Time': getRandom(['0.03ms (GtG)', '1ms (GtG)']),
                        'HDR': getRandom(['HDR10', 'DisplayHDR 1000', 'Dolby Vision'])
                    },
                    'Audio': {
                        'Type': getRandom(['Over-Ear', 'In-Ear', 'On-Ear']),
                        'Connectivity': getRandom(['Wireless 2.4GHz + BT', 'Wired USB-C', 'Wired 3.5mm']),
                        'Driver Size': getRandom(['40mm', '50mm', 'Planar Magnetic']),
                        'Battery Life': getRandom(['40 Hours', '80 Hours', '30 Hours']),
                        'ANC': getRandom(['Yes, Hybrid', 'Yes, Adaptive', 'Passive Isolation'])
                    },
                    'Accessories': {
                        'Type': 'Gaming Peripheral',
                        'Connectivity': getRandom(['Wireless', 'Wired', 'Bluetooth']),
                        'RGB': 'Yes, Customizable',
                        'Color': getRandom(['Black', 'White', 'Mercury'])
                    }
                };

                return { ...baseSpecs, ...(extraSpecs[category] || {}) };
            };

            products.push({
                name: model,
                short: `${cat} - ${brand} High Performance`,
                price: price,
                originalPrice: originalPrice,
                description: `Experience ultimate performance with the ${model}. Designed for gamers who demand the best.`,
                image: getImageUrl(cat, i), // UPDATED: Real, unique images
                features: getFeatures(cat),
                specs: getSpecs(cat, brand, model)
            });
        }
        allProducts[cat] = products; // Store as map for generator
    });

    return allProducts;
};

const data = generateProducts();

module.exports = {
    laptops: data['Laptops'],
    mobiles: data['Mobiles'],
    accessories: data['Accessories'],
    gamingPCs: data['Gaming PC'],
    audio: data['Audio'],
    monitors: data['Monitors']
};
