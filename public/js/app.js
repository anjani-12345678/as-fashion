/* ================================================================
   Blossom Boutique — app.js
   Advanced JavaScript: API fetching, Cart, Modal, GSAP animations,
   IntersectionObserver, Dark Mode, Carousel, Search, Filters, etc.
   Portfolio demo — showcases modern JS patterns
================================================================ */

'use strict';

/* ── CONFIG ─────────────────────────────────────────────────── */
const API_BASE   = '/api';
const WA_NUMBER  = '94762246348';
const CART_KEY   = 'bb_cart_v2';
const THEME_KEY  = 'bb_theme';

/* ── STATE ──────────────────────────────────────────────────── */
let allProducts   = [];
let filteredProducts = [];
let currentFilter = 'all';
let currentSort   = '';
let currentSearch = '';
let cart          = loadCart();
let currentProduct = null;  // product open in quick-view modal
let modalQty      = 1;
let modalSize     = '';
let modalColor    = '';
let heroSlideIdx  = 0;
let heroTimer     = null;
let wishlist      = new Set(JSON.parse(localStorage.getItem('bb_wishlist') || '[]'));

/* ════════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initPreloader();
  initHeader();
  initSearch();
  initHero();
  initCartDrawer();
  initModal();
  renderCartBadge();
  initScrollReveal();
  initBackToTop();
  initNewsletterForm();
  renderReviews();
  initStats();

  // Fetch products from the Express API
  await fetchProducts();
  initFilters();
  renderProducts(allProducts);
});

/* ════════════════════════════════════════════════════════════
   PRELOADER
════════════════════════════════════════════════════════════ */
function initPreloader() {
  const el = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      el.classList.add('fade-out');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 600);
  });
  // Fallback: remove after 3.5s no matter what
  setTimeout(() => el && el.classList.add('fade-out'), 3500);
}

/* ════════════════════════════════════════════════════════════
   THEME (dark / light)
════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/* ════════════════════════════════════════════════════════════
   HEADER – sticky + active nav + hamburger
════════════════════════════════════════════════════════════ */
function initHeader() {
  const header    = document.getElementById('site-header');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const links     = navLinks.querySelectorAll('.nav-link');

  // Scroll → shadow + active nav link
  const onScroll = debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    highlightNavLink(links);
  }, 50);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Hamburger
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close mobile nav on link click
  links.forEach(l => l.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }));

  // Cart & search toggles handled in their own inits
  document.getElementById('cart-toggle').addEventListener('click', openCart);
}

function highlightNavLink(links) {
  const sections = ['home','collection','about','reviews','contact'];
  const scrollY  = window.scrollY + 100;

  let active = sections[0];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) active = id;
  });

  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === `#${active}`);
  });
}

/* ════════════════════════════════════════════════════════════
   SEARCH
════════════════════════════════════════════════════════════ */
function initSearch() {
  const bar    = document.getElementById('search-bar');
  const input  = document.getElementById('search-input');
  const toggle = document.getElementById('search-toggle');
  const close  = document.getElementById('search-close');

  toggle.addEventListener('click', () => {
    bar.classList.toggle('hidden');
    if (!bar.classList.contains('hidden')) input.focus();
  });
  close.addEventListener('click', () => {
    bar.classList.add('hidden');
    input.value = '';
    currentSearch = '';
    applyFilters();
  });

  input.addEventListener('input', debounce(() => {
    currentSearch = input.value.trim().toLowerCase();
    applyFilters();
    // Scroll to collection section
    if (currentSearch) {
      document.getElementById('collection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 300));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      bar.classList.add('hidden');
      input.value = '';
      currentSearch = '';
      applyFilters();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   HERO SLIDESHOW
════════════════════════════════════════════════════════════ */
function initHero() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');

  function goToSlide(idx) {
    slides[heroSlideIdx].classList.remove('active');
    dots[heroSlideIdx].classList.remove('active');
    heroSlideIdx = (idx + slides.length) % slides.length;
    slides[heroSlideIdx].classList.add('active');
    dots[heroSlideIdx].classList.add('active');
  }

  heroTimer = setInterval(() => goToSlide(heroSlideIdx + 1), 5000);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(heroTimer);
      goToSlide(parseInt(dot.dataset.slide));
      heroTimer = setInterval(() => goToSlide(heroSlideIdx + 1), 5000);
    });
  });

  // Touch swipe
  let touchStartX = 0;
  const heroSection = document.getElementById('home');
  heroSection.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  heroSection.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 40) {
      clearInterval(heroTimer);
      goToSlide(heroSlideIdx + (diff > 0 ? 1 : -1));
      heroTimer = setInterval(() => goToSlide(heroSlideIdx + 1), 5000);
    }
  });

  // GSAP hero entrance (if GSAP is loaded)
  waitForGSAP(() => {
    gsap.from('.hero-tag',     { y: 30, opacity: 0, duration: .8, delay: .5, ease: 'power3.out' });
    gsap.from('.hero-content h1', { y: 40, opacity: 0, duration: 1, delay: .7, ease: 'power3.out' });
    gsap.from('.hero-content p',  { y: 30, opacity: 0, duration: .8, delay: .95, ease: 'power3.out' });
    gsap.from('.hero-cta',     { y: 20, opacity: 0, duration: .7, delay: 1.15, ease: 'power3.out' });
    gsap.from('.hero-dots',    { opacity: 0, duration: .5, delay: 1.4 });
  });
}

/* ════════════════════════════════════════════════════════════
   FETCH PRODUCTS FROM API
════════════════════════════════════════════════════════════ */
async function fetchProducts() {
  try {
    const res  = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    allProducts      = json.data;
    filteredProducts = [...allProducts];
  } catch (err) {
    console.warn('API unavailable, using embedded fallback data.', err);
    // Fallback: show a notice but continue with empty array
    // (In a real deployment the server is always running)
    allProducts = [];
    filteredProducts = [];
    showToast('⚠️ Could not connect to server. Start with: node server.js');
  }
}

/* ════════════════════════════════════════════════════════════
   FILTERS & SORT
════════════════════════════════════════════════════════════ */
function initFilters() {
  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentFilter = pill.dataset.cat;
      applyFilters();
    });
  });

  // Sort select
  document.getElementById('sort-select').addEventListener('change', e => {
    currentSort = e.target.value;
    applyFilters();
  });

  // Reset from no-results
  document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

function applyFilters() {
  let result = [...allProducts];

  // Category
  if (currentFilter && currentFilter !== 'all') {
    result = result.filter(p => p.category === currentFilter);
  }

  // Search
  if (currentSearch) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(currentSearch) ||
      p.category.toLowerCase().includes(currentSearch) ||
      p.description.toLowerCase().includes(currentSearch)
    );
  }

  // Sort
  if (currentSort === 'price-asc')  result.sort((a,b) => a.price - b.price);
  if (currentSort === 'price-desc') result.sort((a,b) => b.price - a.price);
  if (currentSort === 'rating')     result.sort((a,b) => b.rating - a.rating);
  if (currentSort === 'popular')    result.sort((a,b) => b.reviews - a.reviews);

  filteredProducts = result;
  renderProducts(result);
}

function resetFilters() {
  currentFilter = 'all';
  currentSearch = '';
  currentSort   = '';
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'all'));
  document.getElementById('sort-select').value = '';
  document.getElementById('search-input').value = '';
  applyFilters();
}

/* ════════════════════════════════════════════════════════════
   RENDER PRODUCTS
════════════════════════════════════════════════════════════ */
function renderProducts(products) {
  const grid     = document.getElementById('product-grid');
  const skeleton = document.getElementById('product-skeleton');
  const noRes    = document.getElementById('no-results');

  // Hide skeleton
  skeleton.classList.add('hidden');
  grid.classList.remove('hidden');

  if (products.length === 0) {
    grid.classList.add('hidden');
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  grid.innerHTML = products.map(p => productCard(p)).join('');

  // Bind card events
  grid.querySelectorAll('.action-quick-view, .product-img').forEach(el => {
    el.addEventListener('click', e => {
      const card = el.closest('.product-card');
      if (!card) return;
      openModal(parseInt(card.dataset.id));
    });
  });
  grid.querySelectorAll('.action-add-cart').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const card = el.closest('.product-card');
      const product = allProducts.find(p => p.id === parseInt(card.dataset.id));
      addToCart(product, product.sizes[0], product.colors[0], 1);
    });
  });
  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleWishlist(id, btn);
    });
  });

  // GSAP stagger on cards
  waitForGSAP(() => {
    gsap.fromTo('.product-card',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: .5, stagger: .07, ease: 'power2.out' }
    );
  });
}

function productCard(p) {
  const badgeHTML = p.badge
    ? `<span class="badge badge-${p.badge.toLowerCase()}">${p.badge}</span>`
    : '';
  const stars = renderStars(p.rating);
  const wishlisted = wishlist.has(p.id);
  const waMsg = encodeURIComponent(`Hi! I want to order the ${p.name} (Rs. ${p.price.toLocaleString()})`);

  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-img">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      ${badgeHTML}
      <button class="wishlist-btn ${wishlisted ? 'wishlisted' : ''}" data-id="${p.id}" aria-label="Wishlist">
        ${wishlisted ? '❤️' : '🤍'}
      </button>
      <div class="product-actions">
        <button class="product-action-btn action-quick-view">👁 Quick View</button>
        <button class="product-action-btn action-add-cart">🛒 Add to Cart</button>
      </div>
    </div>
    <div class="product-info">
      <span class="product-category">${p.category}</span>
      <p class="product-name">${p.name}</p>
      <div class="product-rating">
        <span class="stars">${stars}</span>
        <span>${p.rating} (${p.reviews})</span>
      </div>
      <p class="product-price">Rs. ${p.price.toLocaleString()}</p>
      <a class="product-wa-btn"
         href="https://wa.me/${WA_NUMBER}?text=${waMsg}"
         target="_blank"
         onclick="event.stopPropagation()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.128.559 4.122 1.529 5.855L.057 23.886a.5.5 0 0 0 .614.612l6.169-1.607A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.644-.516-5.148-1.41l-.366-.22-3.793.988.997-3.71-.239-.381A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        Order on WhatsApp
      </a>
    </div>
  </div>`;
}

/* ════════════════════════════════════════════════════════════
   QUICK VIEW MODAL
════════════════════════════════════════════════════════════ */
function initModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', closeModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Qty controls
  document.getElementById('qty-minus').addEventListener('click', () => {
    if (modalQty > 1) { modalQty--; document.getElementById('qty-value').textContent = modalQty; }
  });
  document.getElementById('qty-plus').addEventListener('click', () => {
    modalQty++;
    document.getElementById('qty-value').textContent = modalQty;
  });

  // Add to cart from modal
  document.getElementById('modal-add-cart').addEventListener('click', () => {
    if (!modalSize)  { showToast('⚠️ Please select a size'); return; }
    if (!modalColor) { showToast('⚠️ Please select a color'); return; }
    addToCart(currentProduct, modalSize, modalColor, modalQty);
    closeModal();
  });
}

function openModal(id) {
  const p = allProducts.find(prod => prod.id === id);
  if (!p) return;
  currentProduct = p;
  modalQty   = 1;
  modalSize  = p.sizes[0];
  modalColor = p.colors[0];

  // Populate modal
  document.getElementById('modal-img').src        = p.image;
  document.getElementById('modal-img').alt        = p.name;
  document.getElementById('modal-product-name').textContent = p.name;
  document.getElementById('modal-category').textContent     = p.category;
  document.getElementById('modal-price').textContent        = `Rs. ${p.price.toLocaleString()}`;
  document.getElementById('modal-desc').textContent         = p.description;
  document.getElementById('qty-value').textContent          = '1';

  // Badge
  const badge = document.getElementById('modal-badge');
  if (p.badge) { badge.textContent = p.badge; badge.className = `badge badge-${p.badge.toLowerCase()}`; badge.classList.remove('hidden'); }
  else         { badge.classList.add('hidden'); }

  // Rating
  document.getElementById('modal-rating').innerHTML =
    `<span class="stars">${renderStars(p.rating)}</span> <span>${p.rating} · ${p.reviews} reviews</span>`;

  // Sizes
  const sizesEl = document.getElementById('modal-sizes');
  sizesEl.innerHTML = p.sizes.map(s =>
    `<button class="size-pill ${s === modalSize ? 'active' : ''}" data-size="${s}">${s}</button>`
  ).join('');
  sizesEl.querySelectorAll('.size-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      sizesEl.querySelectorAll('.size-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      modalSize = btn.dataset.size;
    });
  });

  // Colors
  const colorsEl = document.getElementById('modal-colors');
  colorsEl.innerHTML = p.colors.map(c =>
    `<button class="color-pill ${c === modalColor ? 'active' : ''}" data-color="${c}">${c}</button>`
  ).join('');
  colorsEl.querySelectorAll('.color-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      colorsEl.querySelectorAll('.color-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      modalColor = btn.dataset.color;
    });
  });

  // WA direct link
  const waMsg = encodeURIComponent(`Hi! I want to order the ${p.name} (${modalSize}, ${modalColor}) – Rs. ${p.price.toLocaleString()}`);
  document.getElementById('modal-wa-btn').href = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;

  // Open
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('quick-view-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('quick-view-modal').classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

/* ════════════════════════════════════════════════════════════
   CART
════════════════════════════════════════════════════════════ */
function initCartDrawer() {
  document.getElementById('cart-overlay').addEventListener('click', closeCart);
  document.getElementById('cart-close').addEventListener('click', closeCart);
  document.getElementById('cart-shop-link').addEventListener('click', closeCart);
  document.getElementById('checkout-btn').addEventListener('click', checkoutViaWA);
  document.getElementById('clear-cart-btn').addEventListener('click', () => {
    if (confirm('Clear all items from cart?')) {
      cart = [];
      saveCart();
      renderCart();
      renderCartBadge();
      showToast('🗑️ Cart cleared');
    }
  });
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function addToCart(product, size, color, qty = 1) {
  const key = `${product.id}-${size}-${color}`;
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ key, id: product.id, name: product.name, price: product.price, image: product.image, size, color, qty });
  }
  saveCart();
  renderCartBadge();
  showToast(`🛍️ "${product.name}" added to cart!`);

  // Animate badge
  const badge = document.getElementById('cart-badge');
  badge.style.animation = 'none';
  badge.offsetHeight; // reflow
  badge.style.animation = 'pop .3s ease';
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  renderCart();
  renderCartBadge();
}

function updateQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  renderCartBadge();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer    = document.getElementById('cart-footer');
  const badgeDrawer = document.getElementById('cart-badge-drawer');
  const total = cartTotal();

  badgeDrawer.textContent = cart.reduce((s, i) => s + i.qty, 0);

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <span>🛍️</span>
        <p>Your cart is empty</p>
        <a href="#collection" class="btn btn-primary" id="cart-shop-link">Start Shopping</a>
      </div>`;
    document.getElementById('cart-shop-link').addEventListener('click', closeCart);
    footer.classList.add('hidden');
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-row" data-key="${item.key}">
      <img class="cart-row-img" src="${item.image}" alt="${item.name}" />
      <div class="cart-row-info">
        <p class="cart-row-name">${item.name}</p>
        <p class="cart-row-meta">${item.size} · ${item.color}</p>
        <p class="cart-row-price">Rs. ${(item.price * item.qty).toLocaleString()}</p>
      </div>
      <div class="cart-row-right">
        <button class="cart-remove" data-key="${item.key}" aria-label="Remove">✕</button>
        <div class="cart-qty-ctrl">
          <button class="cart-qty-btn" data-key="${item.key}" data-d="-1">−</button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" data-key="${item.key}" data-d="1">+</button>
        </div>
      </div>
    </div>`).join('');

  document.querySelectorAll('.cart-remove').forEach(btn =>
    btn.addEventListener('click', () => removeFromCart(btn.dataset.key)));
  document.querySelectorAll('.cart-qty-btn').forEach(btn =>
    btn.addEventListener('click', () => updateQty(btn.dataset.key, parseInt(btn.dataset.d))));

  document.getElementById('cart-total-amount').textContent = `Rs. ${total.toLocaleString()}`;
  footer.classList.remove('hidden');
}

function renderCartBadge() {
  const count  = cart.reduce((s,i) => s + i.qty, 0);
  const badge  = document.getElementById('cart-badge');
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function cartTotal() {
  return cart.reduce((s, i) => s + i.price * i.qty, 0);
}

/* ── Checkout via WhatsApp ── */
function checkoutViaWA() {
  if (cart.length === 0) return;

  const lines = cart
    .map(i => `• ${i.name} (${i.size}, ${i.color}) ×${i.qty} — Rs.${(i.price*i.qty).toLocaleString()}`)
    .join('\n');

  const message = encodeURIComponent(
    `Hi Blossom Boutique! 🌸\n\nI'd like to place an order:\n\n${lines}\n\n*Total: Rs.${cartTotal().toLocaleString()}*\n\nPlease confirm availability. Thank you!`
  );

  window.open(`https://wa.me/${WA_NUMBER}?text=${message}`, '_blank');
}

/* ── Persist cart ── */
function saveCart()  { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function loadCart()  {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

/* ════════════════════════════════════════════════════════════
   WISHLIST
════════════════════════════════════════════════════════════ */
function toggleWishlist(id, btn) {
  if (wishlist.has(id)) {
    wishlist.delete(id);
    btn.textContent = '🤍';
    btn.classList.remove('wishlisted');
    showToast('💔 Removed from wishlist');
  } else {
    wishlist.add(id);
    btn.textContent = '❤️';
    btn.classList.add('wishlisted');
    showToast('❤️ Added to wishlist!');
  }
  localStorage.setItem('bb_wishlist', JSON.stringify([...wishlist]));
}

/* ════════════════════════════════════════════════════════════
   CUSTOMER REVIEWS DATA + RENDER
════════════════════════════════════════════════════════════ */
const reviews = [
  { name:'Dilini P.',   location:'Colombo',   rating:5, text:'Absolutely love the quality! My Floral Midi Dress arrived in 2 days and fits perfectly. Will definitely order again.', product:'Floral Midi Dress' },
  { name:'Amaya S.',    location:'Kandy',     rating:5, text:'The Pastel Co-ord Set is even more beautiful in person. The fabric is so soft and the colour is exactly as shown.', product:'Pastel Co-ord Set' },
  { name:'Nimesha K.',  location:'Galle',     rating:4, text:'Great experience! Fast delivery and the packaging was really cute. The size exchange was hassle-free too.', product:'Boho Maxi Skirt' },
  { name:'Tharushi R.', location:'Negombo',   rating:5, text:'I ordered 3 items and all arrived within 3 days. The Denim Jacket is my favourite piece this season! 💕', product:'Denim Jacket' },
  { name:'Sachini W.',  location:'Matara',    rating:5, text:'Cash on delivery made it so easy. No worries about online payments. The Classic Jumpsuit is stunning!', product:'Classic Jumpsuit' },
  { name:'Hasini F.',   location:'Colombo',   rating:4, text:'Super cute styles and very affordable. The WhatsApp ordering process is so simple — ordered and confirmed in 5 minutes!', product:'Ruffle Crop Top' },
  { name:'Malsha D.',   location:'Kurunegala',rating:5, text:'Amazing customer service. They helped me pick the right size via WhatsApp. The Linen Shirt Dress is perfect for office!', product:'Linen Shirt Dress' },
  { name:'Ishara N.',   location:'Jaffna',    rating:5, text:'Delivered all the way to Jaffna with no issues! Very impressed. The Wrap Blouse is gorgeous and great value.', product:'Wrap Blouse' },
];

function renderReviews() {
  const track = document.getElementById('reviews-track');
  const dots  = document.getElementById('review-dots');

  track.innerHTML = reviews.map(r => `
    <div class="review-card reveal-up">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <p class="review-name">${r.name}</p>
          <p class="review-location">📍 ${r.location}</p>
          <p class="review-product">Bought: ${r.product}</p>
        </div>
      </div>
    </div>`).join('');

  // Dots for carousel
  dots.innerHTML = reviews.map((_,i) =>
    `<button class="carousel-dot ${i===0?'active':''}" data-idx="${i}" aria-label="Review ${i+1}"></button>`
  ).join('');

  dots.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const idx  = parseInt(dot.dataset.idx);
      const card = track.querySelectorAll('.review-card')[idx];
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      dots.querySelectorAll('.carousel-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
    });
  });

  // Auto-update dots on scroll
  track.addEventListener('scroll', debounce(() => {
    const cards = track.querySelectorAll('.review-card');
    let closest = 0;
    let minDiff = Infinity;
    cards.forEach((card, i) => {
      const diff = Math.abs(card.getBoundingClientRect().left - track.getBoundingClientRect().left);
      if (diff < minDiff) { minDiff = diff; closest = i; }
    });
    dots.querySelectorAll('.carousel-dot').forEach((d,i) => d.classList.toggle('active', i === closest));
  }, 50));
}

/* ════════════════════════════════════════════════════════════
   STATS COUNTER (count-up animation)
════════════════════════════════════════════════════════════ */
function initStats() {
  const counters = document.querySelectorAll('.count-up');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start  = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver + GSAP)
════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));

  // GSAP ScrollTrigger for section headings
  waitForGSAP(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Parallax on about image
      gsap.to('.about-img-frame img', {
        yPercent: -12,
        ease: 'none',
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Info cards stagger
      gsap.from('.info-card', {
        y: 40, opacity: 0, duration: .6, stagger: .12, ease: 'power2.out',
        scrollTrigger: { trigger: '#info', start: 'top 80%' }
      });
    }
  });
}

/* ════════════════════════════════════════════════════════════
   NEWSLETTER FORM
════════════════════════════════════════════════════════════ */
function initNewsletterForm() {
  document.getElementById('newsletter-form').addEventListener('submit', e => {
    e.preventDefault();
    const phone = document.getElementById('nl-phone').value.trim();
    if (!phone) return;

    // In production: POST to your API or a service like Firebase
    const msg = encodeURIComponent(`Hi! Please add me to your new arrivals list. My number is ${phone} 🌸`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');

    showToast('🌸 You\'re on the list! Expect amazing deals soon.');
    document.getElementById('nl-phone').value = '';
  });
}

/* ════════════════════════════════════════════════════════════
   BACK TO TOP
════════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    btn.classList.toggle('hidden', window.scrollY < 400);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ════════════════════════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════════════════════ */
let toastTimer = null;
function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════ */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/** Wait for GSAP to be available (loaded via CDN defer) */
function waitForGSAP(fn) {
  if (typeof gsap !== 'undefined') { fn(); return; }
  const check = setInterval(() => {
    if (typeof gsap !== 'undefined') { clearInterval(check); fn(); }
  }, 50);
  setTimeout(() => clearInterval(check), 5000); // give up after 5s
}

/* ════════════════════════════════════════════════════════════
   SERVICE WORKER REGISTRATION (PWA-ready)
════════════════════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* SW is optional; fail silently */
    });
  });
}

/* ════════════════════════════════════════════════════════════
   DEV UTILITIES (console info for portfolio viewers)
════════════════════════════════════════════════════════════ */
console.log('%c🌸 Blossom Boutique v2.0', 'font-size:16px;color:#c9789e;font-weight:bold;');
console.log('%cStack: Node.js + Express REST API · Vanilla JS · GSAP · CSS Custom Properties', 'color:#888;font-size:12px');
console.log('%cAPI endpoints: /api/products  /api/categories  /api/orders  /api/stats', 'color:#6b9;font-size:11px');
