-- AI Shopping Mall Database Schema
-- Run this SQL to initialize your PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_ai BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- SEED DATA
-- ========================

-- Seed Stores
INSERT INTO stores (id, name, category, description, image_url) VALUES
    ('a1b2c3d4-0001-0001-0001-000000000001', 'CyberMart', 'Electronics & Tech', 'Your one-stop destination for the latest laptops, smartphones, and cutting-edge tech accessories. Powered by innovation.', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600'),
    ('a1b2c3d4-0002-0002-0002-000000000002', 'Thread & Co.', 'Fashion & Apparel', 'Curated fashion for every occasion. From everyday streetwear to elegant formalwear, discover your perfect style.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'),
    ('a1b2c3d4-0003-0003-0003-000000000003', 'CozySpaces', 'Home & Living', 'Transform your living space with our premium furniture, artisan decor, and top-of-the-line kitchenware collections.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600'),
    ('a1b2c3d4-0004-0004-0004-000000000004', 'PlaySphere', 'Entertainment & Toys', 'Unleash your imagination with our massive selection of board games, action figures, video games, and collectibles.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600')
ON CONFLICT (id) DO NOTHING;

-- Seed Products for CyberMart (Electronics)
INSERT INTO products (id, store_id, name, description, price, stock_quantity, image_url) VALUES
    ('p0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'ProBook Ultra 15', 'High-performance 15" laptop with Intel Core i9, 32GB RAM, 1TB NVMe SSD, RTX 4070 GPU. Perfect for professionals and creators.', 1499.99, 25, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
    ('p0000001-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'NexPhone 15 Pro', 'Flagship smartphone with 6.7" OLED display, 200MP triple camera, 5G connectivity, and all-day battery life.', 999.99, 50, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'),
    ('p0000001-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'AirPods Pro Max X', 'Premium over-ear wireless headphones with active noise cancellation, 30-hour battery, and studio-quality sound.', 349.99, 75, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
    ('p0000001-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'SmartWatch Elite', 'Advanced smartwatch with ECG monitoring, GPS, sleep tracking, and 7-day battery. Compatible with iOS and Android.', 299.99, 40, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
    ('p0000001-0001-0001-0001-000000000005', 'a1b2c3d4-0001-0001-0001-000000000001', '4K Gaming Monitor 27"', 'Ultra-smooth 27" 4K IPS gaming monitor with 165Hz refresh rate, 1ms response time, and HDR600 support.', 549.99, 30, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'),
    ('p0000001-0001-0001-0001-000000000006', 'a1b2c3d4-0001-0001-0001-000000000001', 'MechKey Pro Keyboard', 'Premium mechanical keyboard with Cherry MX switches, RGB backlight, programmable macros, and aluminum build.', 149.99, 60, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'),
    ('p0000001-0001-0001-0001-000000000007', 'a1b2c3d4-0001-0001-0001-000000000001', 'Portable SSD 2TB', 'Ultra-fast portable SSD with USB-C, read speeds up to 2000 MB/s. Rugged and pocket-sized.', 179.99, 90, 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=400'),
    ('p0000001-0001-0001-0001-000000000008', 'a1b2c3d4-0001-0001-0001-000000000001', 'StreamCam 4K', '4K webcam with auto-focus, built-in ring light, and noise-canceling microphone. Perfect for streaming and video calls.', 129.99, 45, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400')
ON CONFLICT (id) DO NOTHING;

-- Seed Products for Thread & Co. (Fashion)
INSERT INTO products (id, store_id, name, description, price, stock_quantity, image_url) VALUES
    ('p0000002-0002-0002-0002-000000000001', 'a1b2c3d4-0002-0002-0002-000000000002', 'Classic Denim Jacket', 'Timeless stonewashed denim jacket with reinforced stitching. Available in S, M, L, XL. A wardrobe essential.', 89.99, 100, 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400'),
    ('p0000002-0002-0002-0002-000000000002', 'a1b2c3d4-0002-0002-0002-000000000002', 'Slim Fit Chinos', 'Modern slim-fit chinos in premium stretch cotton. Versatile enough for office or weekend wear.', 59.99, 120, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'),
    ('p0000002-0002-0002-0002-000000000003', 'a1b2c3d4-0002-0002-0002-000000000002', 'Running Sneakers Pro', 'Lightweight running shoes with responsive foam cushioning and breathable mesh upper. For the daily runner.', 119.99, 80, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
    ('p0000002-0002-0002-0002-000000000004', 'a1b2c3d4-0002-0002-0002-000000000002', 'Cashmere Crew Sweater', 'Luxuriously soft 100% cashmere crew-neck sweater. A sophisticated addition to any wardrobe.', 159.99, 60, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400'),
    ('p0000002-0002-0002-0002-000000000005', 'a1b2c3d4-0002-0002-0002-000000000002', 'Leather Tote Bag', 'Handcrafted genuine leather tote with interior pockets and magnetic clasp. Spacious and elegant.', 199.99, 40, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400'),
    ('p0000002-0002-0002-0002-000000000006', 'a1b2c3d4-0002-0002-0002-000000000002', 'Floral Summer Dress', 'Breezy floral midi dress in lightweight rayon. Perfect for summer outings and garden parties.', 74.99, 90, 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400'),
    ('p0000002-0002-0002-0002-000000000007', 'a1b2c3d4-0002-0002-0002-000000000002', 'Polarized Sunglasses', 'Classic aviator sunglasses with UV400 polarized lenses and stainless steel frame. Timeless style.', 49.99, 150, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400')
ON CONFLICT (id) DO NOTHING;

-- Seed Products for CozySpaces (Home & Living)
INSERT INTO products (id, store_id, name, description, price, stock_quantity, image_url) VALUES
    ('p0000003-0003-0003-0003-000000000001', 'a1b2c3d4-0003-0003-0003-000000000003', 'Scandinavian Sofa', 'Modern 3-seater sofa in premium fabric upholstery with solid oak legs. Comfort meets minimalist design.', 899.99, 15, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'),
    ('p0000003-0003-0003-0003-000000000002', 'a1b2c3d4-0003-0003-0003-000000000003', 'Artisan Coffee Table', 'Hand-crafted walnut coffee table with hairpin legs. Each piece is unique with natural wood grain patterns.', 349.99, 20, 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400'),
    ('p0000003-0003-0003-0003-000000000003', 'a1b2c3d4-0003-0003-0003-000000000003', 'Smart Air Purifier', 'HEPA H13 air purifier covering 500 sq ft with real-time air quality display and quiet sleep mode.', 249.99, 35, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'),
    ('p0000003-0003-0003-0003-000000000004', 'a1b2c3d4-0003-0003-0003-000000000003', 'Cast Iron Dutch Oven', 'Enameled cast iron dutch oven (5.5 qt) with superior heat retention. Perfect for soups, stews, and bread baking.', 129.99, 50, 'https://images.unsplash.com/photo-1584992236310-6ded5f1f6a7e?w=400'),
    ('p0000003-0003-0003-0003-000000000005', 'a1b2c3d4-0003-0003-0003-000000000003', 'Bohemian Wall Art Set', 'Set of 3 framed botanical prints in a matching gallery wall arrangement. Adds warmth to any living space.', 89.99, 65, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400'),
    ('p0000003-0003-0003-0003-000000000006', 'a1b2c3d4-0003-0003-0003-000000000003', 'Egyptian Cotton Bedding Set', '1000-thread-count Egyptian cotton bedding set (King) with duvet cover, 2 pillowcases. Cloud-like softness.', 189.99, 40, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'),
    ('p0000003-0003-0003-0003-000000000007', 'a1b2c3d4-0003-0003-0003-000000000003', 'Himalayan Salt Lamp', 'Natural Himalayan pink salt lamp with dimmer switch. Creates a warm, ambient glow and purifies the air.', 39.99, 120, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400')
ON CONFLICT (id) DO NOTHING;

-- Seed Products for PlaySphere (Entertainment & Toys)
INSERT INTO products (id, store_id, name, description, price, stock_quantity, image_url) VALUES
    ('p0000004-0004-0004-0004-000000000001', 'a1b2c3d4-0004-0004-0004-000000000004', 'Galaxy Explorer Board Game', 'Award-winning strategy board game for 2-5 players. Explore star systems, build colonies, and conquer the galaxy. Ages 10+.', 49.99, 80, 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400'),
    ('p0000004-0004-0004-0004-000000000002', 'a1b2c3d4-0004-0004-0004-000000000004', 'Space Ranger Action Figure', '12" detailed space ranger action figure with 25 points of articulation, LED light-up helmet, and accessories. Ages 6+.', 29.99, 150, 'https://images.unsplash.com/photo-1608889175123-8ee362288555?w=400'),
    ('p0000004-0004-0004-0004-000000000003', 'a1b2c3d4-0004-0004-0004-000000000004', 'Cosmic Quest Video Game', 'Open-world space exploration RPG for PC and consoles. 100+ hours of gameplay, stunning visuals. ESRB: E10+.', 59.99, 200, 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400'),
    ('p0000004-0004-0004-0004-000000000004', 'a1b2c3d4-0004-0004-0004-000000000004', 'LEGO Space Station Kit', '2500-piece LEGO set to build a detailed International Space Station replica. Includes 6 minifigures. Ages 14+.', 79.99, 60, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=400'),
    ('p0000004-0004-0004-0004-000000000005', 'a1b2c3d4-0004-0004-0004-000000000004', 'Dinosaur Discovery Set', 'Educational paleontology kit with excavation tools, 5 hidden dino fossils, and a guide book. Ages 6-12.', 34.99, 90, 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400'),
    ('p0000004-0004-0004-0004-000000000006', 'a1b2c3d4-0004-0004-0004-000000000004', 'Drone Mini Explorer', 'Beginner-friendly mini drone with altitude hold, 720p camera, and 15-min flight time. Includes extra batteries. Ages 10+.', 89.99, 70, 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400'),
    ('p0000004-0004-0004-0004-000000000007', 'a1b2c3d4-0004-0004-0004-000000000004', 'Puzzle Master 1000pc', 'Stunning 1000-piece jigsaw puzzle featuring a fantasy world map. Finished size: 27" x 20". For all ages.', 24.99, 130, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400'),
    ('p0000004-0004-0004-0004-000000000008', 'a1b2c3d4-0004-0004-0004-000000000004', 'Remote Control Race Car', 'High-speed RC race car reaching 30mph, with 4WD, rechargeable battery, and durable roll cage. Ages 8+.', 54.99, 85, 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400')
ON CONFLICT (id) DO NOTHING;

