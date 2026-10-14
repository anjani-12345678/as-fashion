// ============================================================
//  server.js  –  Blossom Boutique Express API
//  Portfolio sample: demonstrates REST API, middleware, routing
// ============================================================

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory data store (replace with a real DB in production)
const products = [
  {
    id: 1, name: 'Floral Midi Dress',
    price: 4500, category: 'dresses',
    badge: 'New', rating: 4.8, reviews: 24,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop',
    description: 'A breezy floral midi dress perfect for any occasion. Crafted with lightweight fabric to keep you comfortable all day long.',
    sizes: ['XS','S','M','L','XL'], colors: ['Pink','White','Blue'],
  },
  {
    id: 2, name: 'Pastel Co-ord Set',
    price: 5800, category: 'sets',
    badge: 'Hot', rating: 4.9, reviews: 41,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=500&auto=format&fit=crop',
    description: 'Trendy co-ordinated top and skirt set in gorgeous pastel tones. Mix and match for versatile everyday looks.',
    sizes: ['S','M','L'], colors: ['Lavender','Mint'],
  },
  {
    id: 3, name: 'Linen Shirt Dress',
    price: 3900, category: 'dresses',
    badge: null, rating: 4.6, reviews: 17,
    image: 'https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=500&auto=format&fit=crop',
    description: 'Relaxed linen shirt dress ideal for warm Sri Lankan days. Features a buttoned front and relaxed silhouette.',
    sizes: ['XS','S','M','L','XL'], colors: ['White','Beige','Sky Blue'],
  },
  {
    id: 4, name: 'Wrap Blouse',
    price: 2200, category: 'tops',
    badge: 'Sale', rating: 4.4, reviews: 33,
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop',
    description: 'Flattering wrap-style blouse with a self-tie waist. Pairs beautifully with high-waist jeans or tailored trousers.',
    sizes: ['XS','S','M','L'], colors: ['Black','Dusty Rose','Sage'],
  },
  {
    id: 5, name: 'Boho Maxi Skirt',
    price: 3200, category: 'skirts',
    badge: 'New', rating: 4.7, reviews: 29,
    image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500&auto=format&fit=crop',
    description: 'Flowing boho maxi skirt with a whimsical print. The elastic waistband ensures all-day comfort.',
    sizes: ['XS','S','M','L','XL'], colors: ['Terracotta','Forest Green'],
  },
  {
    id: 6, name: 'Denim Jacket',
    price: 6500, category: 'outerwear',
    badge: null, rating: 4.8, reviews: 52,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&auto=format&fit=crop',
    description: 'Classic denim jacket, a wardrobe essential. Distressed detailing for an effortlessly cool look.',
    sizes: ['S','M','L','XL'], colors: ['Light Blue','Dark Blue'],
  },
  {
    id: 7, name: 'Ruffle Crop Top',
    price: 1800, category: 'tops',
    badge: 'Hot', rating: 4.5, reviews: 38,
    image: 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=500&auto=format&fit=crop',
    description: 'Playful ruffled crop top that adds a fun touch to any outfit. Perfect for a day out or beach trip.',
    sizes: ['XS','S','M','L'], colors: ['White','Coral','Lilac'],
  },
  {
    id: 8, name: 'Classic Jumpsuit',
    price: 5200, category: 'jumpsuits',
    badge: null, rating: 4.9, reviews: 19,
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&auto=format&fit=crop',
    description: 'Chic classic jumpsuit that works for day or evening wear. Clean lines and a relaxed fit for effortless style.',
    sizes: ['XS','S','M','L','XL'], colors: ['Black','Camel','Navy'],
  },
  {
    id: 9, name: 'Summer Sundress',
    price: 3600, category: 'dresses',
    badge: 'New', rating: 4.7, reviews: 14,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop',
    description: 'Light and airy sundress for warm days. The smocked bodice provides a comfortable, adjustable fit.',
    sizes: ['XS','S','M','L'], colors: ['Yellow','Pink','Blue'],
  },
  {
    id: 10, name: 'Wide-Leg Trousers',
    price: 4100, category: 'bottoms',
    badge: null, rating: 4.6, reviews: 22,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=500&auto=format&fit=crop',
    description: 'Elevated wide-leg trousers for a polished, sophisticated look. High waist with a flattering wide leg.',
    sizes: ['XS','S','M','L','XL'], colors: ['Black','Cream','Terracotta'],
  },
  {
    id: 11, name: 'Knit Cardigan',
    price: 4800, category: 'outerwear',
    badge: 'Hot', rating: 4.8, reviews: 31,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop',
    description: 'Cozy oversized knit cardigan in a butter-soft fabric. The perfect layering piece for cooler evenings.',
    sizes: ['S','M','L','XL'], colors: ['Oat','Dusty Pink','Sage'],
  },
  {
    id: 12, name: 'Satin Slip Dress',
    price: 4300, category: 'dresses',
    badge: 'Sale', rating: 4.9, reviews: 45,
    image: 'https://images.unsplash.com/photo-1566479179817-e8f1fc9a1bed?w=500&auto=format&fit=crop',
    description: 'Luxurious satin slip dress that transitions effortlessly from day to night. Minimalist elegance at its best.',
    sizes: ['XS','S','M','L'], colors: ['Champagne','Black','Blush'],
  },
];

// ── In-memory orders (replaced by a DB in production)
const orders = [];

// ─────────────────────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────────────────────

// GET  /api/products          → all products (supports ?category=&search=)
app.get('/api/products', (req, res) => {
  let result = [...products];
  const { category, search, sort } = req.query;

  if (category && category !== 'all') {
    result = result.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }
  if (sort === 'price-asc')   result.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc')  result.sort((a,b) => b.price - a.price);
  if (sort === 'rating')      result.sort((a,b) => b.rating - a.rating);
  if (sort === 'popular')     result.sort((a,b) => b.reviews - a.reviews);

  res.json({ success: true, count: result.length, data: result });
});

// GET  /api/products/:id      → single product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, data: product });
});

// GET  /api/categories        → distinct categories
app.get('/api/categories', (req, res) => {
  const cats = ['all', ...new Set(products.map(p => p.category))];
  res.json({ success: true, data: cats });
});

// POST /api/orders            → place a WhatsApp order (stores record)
app.post('/api/orders', (req, res) => {
  const { name, phone, items, total } = req.body;
  if (!name || !phone || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  const order = {
    id: `BB-${Date.now()}`,
    name, phone, items, total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);

  // Build WhatsApp message
  const itemsList = items.map(i => `• ${i.name} (${i.size}) × ${i.qty} — Rs.${i.price * i.qty}`).join('%0A');
  const waMsg = `Hi!%20I'd%20like%20to%20place%20an%20order%3A%0A%0A${itemsList}%0A%0A*Total%3A%20Rs.${total}*%0AName%3A%20${encodeURIComponent(name)}`;
  const waUrl = `https://wa.me/94762246348?text=${waMsg}`;

  res.status(201).json({ success: true, data: { order, waUrl } });
});

// GET  /api/stats             → quick stats (for portfolio demo)
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      totalOrders: orders.length,
      categories: new Set(products.map(p => p.category)).size,
      avgRating: (products.reduce((s,p) => s + p.rating, 0) / products.length).toFixed(2),
    }
  });
});

// Fallback: serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌸 Blossom Boutique server running at http://localhost:${PORT}`);
  console.log(`   API → http://localhost:${PORT}/api/products\n`);
});
