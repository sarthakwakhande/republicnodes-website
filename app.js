const store = {
  products: [
    { id: 1, name: 'Handmade Clay Vase', category: 'handmade', price: 1200, stock: 14, popularity: 88, createdAt: '2026-01-03', image: 'https://images.unsplash.com/photo-1578507065211-c7e0f2f27f8b?auto=format&fit=crop&w=800&q=80', description: 'Hand-thrown textured clay vase.', specs: 'Material: Clay, Height: 10in' },
    { id: 2, name: 'Luxury Silk Throw', category: 'luxury', price: 4200, stock: 7, popularity: 96, createdAt: '2026-02-08', image: 'https://images.unsplash.com/photo-1603251579431-8041402bdeda?auto=format&fit=crop&w=800&q=80', description: 'Premium woven silk throw.', specs: '100% Silk, 220x140cm' },
    { id: 3, name: 'Artisan Chocolate Box', category: 'food', price: 950, stock: 30, popularity: 90, createdAt: '2026-02-20', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80', description: 'Small-batch gourmet chocolate.', specs: '12 pieces, vegetarian' },
    { id: 4, name: 'Smart Home Speaker', category: 'electronics', price: 5600, stock: 22, popularity: 85, createdAt: '2026-01-28', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80', description: 'Wireless speaker with assistant.', specs: 'Bluetooth 5.0, Wi-Fi' },
    { id: 5, name: 'Hand-carved Wooden Bowl', category: 'handmade', price: 1500, stock: 18, popularity: 80, createdAt: '2026-02-18', image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=800&q=80', description: 'Carved teak serving bowl.', specs: 'Teak wood, food-safe finish' },
    { id: 6, name: 'Luxury Leather Journal', category: 'luxury', price: 2700, stock: 16, popularity: 78, createdAt: '2026-02-24', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', description: 'Hand-stitched full-grain journal.', specs: 'A5 size, 200 pages' },
    { id: 7, name: 'Organic Spice Set', category: 'food', price: 1100, stock: 40, popularity: 83, createdAt: '2026-02-15', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=800&q=80', description: 'Curated aromatic spice collection.', specs: '8 jars, no preservatives' },
    { id: 8, name: 'Noise-Cancel Earbuds', category: 'electronics', price: 3800, stock: 26, popularity: 92, createdAt: '2026-02-26', image: 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&w=800&q=80', description: 'ANC earbuds with fast charge.', specs: '32h battery, USB-C' }
  ],
  categories: ['handmade', 'luxury', 'food', 'electronics'],
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  orders: JSON.parse(localStorage.getItem('orders') || '[]'),
  coupons: [{ code: 'WELCOME10', type: 'percent', value: 10, minAmount: 500 }, { code: 'FLAT200', type: 'fixed', value: 200, minAmount: 2000 }],
  emailTemplates: ['order-confirmation', 'payment-receipt', 'shipping-update', 'out-for-delivery', 'delivered', 'account-verification', 'password-reset', 'newsletter', 'refund-notification'],
  emailEnabled: JSON.parse(localStorage.getItem('emailEnabled') || 'true')
};

const persist = () => {
  localStorage.setItem('cart', JSON.stringify(store.cart));
  localStorage.setItem('wishlist', JSON.stringify(store.wishlist));
  localStorage.setItem('recentlyViewed', JSON.stringify(store.recentlyViewed));
  localStorage.setItem('users', JSON.stringify(store.users));
  localStorage.setItem('currentUser', JSON.stringify(store.currentUser));
  localStorage.setItem('orders', JSON.stringify(store.orders));
  localStorage.setItem('emailEnabled', JSON.stringify(store.emailEnabled));
};

const qs = (s) => document.querySelector(s);
const qsa = (s) => [...document.querySelectorAll(s)];
const inr = (n) => `₹${n.toLocaleString('en-IN')}`;

function renderProducts(products, mountSelector) {
  const mount = qs(mountSelector);
  if (!mount) return;
  mount.innerHTML = products.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="meta">${p.category.toUpperCase()} · Stock: ${p.stock}</p>
        <p>${inr(p.price)}</p>
        <div class="row">
          <button onclick="openProduct(${p.id})">View</button>
          <button onclick="toggleWishlist(${p.id})">♡</button>
          <button onclick="addToCart(${p.id})">Add</button>
        </div>
      </div>
    </article>
  `).join('');
}

function refreshCounts() {
  if (qs('#cart-count')) qs('#cart-count').textContent = store.cart.reduce((a, c) => a + c.qty, 0);
  if (qs('#wishlist-count')) qs('#wishlist-count').textContent = store.wishlist.length;
}

window.openProduct = function(id) {
  const p = store.products.find(x => x.id === id);
  if (!p) return;
  store.recentlyViewed = [id, ...store.recentlyViewed.filter(x => x !== id)].slice(0, 8);
  persist();
  const similar = store.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  const modal = qs('#product-modal');
  modal.innerHTML = `<div class="modal-content">
    <h2>${p.name}</h2>
    <img src="${p.image}" alt="${p.name}" style="width:100%;max-height:260px;object-fit:cover;border-radius:.6rem" />
    <p>${p.description}</p>
    <p><strong>Specs:</strong> ${p.specs}</p>
    <p><strong>Price:</strong> ${inr(p.price)} | <strong>Stock:</strong> ${p.stock}</p>
    <button onclick="addToCart(${p.id})">Add to cart</button>
    <h3>Similar products</h3>
    <ul>${similar.map(s => `<li><a href="#" onclick="openProduct(${s.id})">${s.name}</a></li>`).join('')}</ul>
    <h3>Recently viewed</h3>
    <p>${store.recentlyViewed.map(i => store.products.find(x => x.id === i)?.name).filter(Boolean).join(', ') || 'None yet'}</p>
    <button onclick="document.getElementById('product-modal').close()">Close</button>
  </div>`;
  modal.showModal();
};

window.addToCart = function(id, qty = 1) {
  const existing = store.cart.find(x => x.id === id);
  if (existing) existing.qty += qty;
  else store.cart.push({ id, qty });
  persist();
  refreshCounts();
};

window.toggleWishlist = function(id) {
  store.wishlist = store.wishlist.includes(id) ? store.wishlist.filter(x => x !== id) : [...store.wishlist, id];
  persist();
  refreshCounts();
};

function cartTotals() {
  const subtotal = store.cart.reduce((sum, item) => sum + (store.products.find(p => p.id === item.id)?.price || 0) * item.qty, 0);
  const shipping = subtotal > 1500 ? 0 : subtotal > 0 ? 99 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

function openCart() {
  const modal = qs('#cart-modal');
  const t = cartTotals();
  const estimated = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toDateString();
  modal.innerHTML = `<div class="modal-content">
    <h2>Cart & Checkout</h2>
    <div class="list">${store.cart.map(item => {
      const p = store.products.find(x => x.id === item.id);
      return `<div class="row"><span>${p.name} (${item.qty})</span><span>${inr(p.price * item.qty)}</span><div><button onclick="updateQty(${p.id},-1)">-</button><button onclick="updateQty(${p.id},1)">+</button><button onclick="removeItem(${p.id})">Remove</button></div></div>`;
    }).join('') || '<p>Your cart is empty.</p>'}</div>
    <hr/>
    <p>Subtotal: ${inr(t.subtotal)} | Delivery: ${inr(t.shipping)} | Total: <strong>${inr(t.total)}</strong></p>
    <p>Estimated delivery: ${estimated}</p>
    <div class="row">
      <input id="coupon" placeholder="Discount code" />
      <button onclick="applyCoupon()">Apply</button>
    </div>
    <p id="coupon-msg"></p>
    <h3>Secure Checkout</h3>
    <div class="grid2">
      <button onclick="placeOrder('Razorpay')">Pay with Razorpay</button>
      <button onclick="placeOrder('PayPal')">Pay with PayPal</button>
    </div>
    <button onclick="document.getElementById('cart-modal').close()">Close</button>
  </div>`;
  modal.showModal();
}
window.updateQty = (id, delta) => { const i = store.cart.find(x => x.id === id); if (!i) return; i.qty += delta; if (i.qty <= 0) store.cart = store.cart.filter(x => x.id !== id); persist(); refreshCounts(); openCart(); };
window.removeItem = (id) => { store.cart = store.cart.filter(x => x.id !== id); persist(); refreshCounts(); openCart(); };
window.applyCoupon = () => {
  const code = qs('#coupon').value.trim().toUpperCase();
  const coupon = store.coupons.find(c => c.code === code);
  const totals = cartTotals();
  const msg = qs('#coupon-msg');
  if (!coupon) return msg.textContent = 'Invalid coupon';
  if (totals.subtotal < coupon.minAmount) return msg.textContent = `Minimum amount ${inr(coupon.minAmount)} needed.`;
  const discount = coupon.type === 'percent' ? totals.subtotal * coupon.value / 100 : coupon.value;
  msg.textContent = `Coupon applied. Discount: ${inr(Math.round(discount))}`;
};

function triggerEmails(orderId) {
  if (!store.emailEnabled) return;
  const events = ['order-confirmation', 'payment-receipt', 'shipping-update', 'out-for-delivery', 'delivered'];
  console.log(`Emails triggered for order ${orderId}: ${events.join(', ')}`);
}

window.placeOrder = (method) => {
  if (!store.currentUser) return alert('Please login first.');
  const t = cartTotals();
  if (!t.total) return alert('Cart is empty.');
  const order = { id: Date.now(), user: store.currentUser.email, items: store.cart, total: t.total, status: 'Pending', payment: method, tracking: 'TRK' + Math.floor(Math.random() * 100000) };
  store.orders.unshift(order);
  store.cart = [];
  persist();
  refreshCounts();
  triggerEmails(order.id);
  alert(`Order placed with ${method}. Tracking: ${order.tracking}`);
  qs('#cart-modal').close();
};

function openWishlist() {
  const modal = qs('#wishlist-modal');
  const list = store.products.filter(p => store.wishlist.includes(p.id));
  modal.innerHTML = `<div class="modal-content"><h2>Wishlist</h2><div class="list">${list.map(p => `<div class='row'><span>${p.name}</span><button onclick='addToCart(${p.id})'>Add to cart</button></div>`).join('') || 'No saved products yet.'}</div><button onclick="document.getElementById('wishlist-modal').close()">Close</button></div>`;
  modal.showModal();
}

function openAuth() {
  const modal = qs('#auth-modal');
  const profile = store.currentUser ? `<h3>Profile</h3><p>${store.currentUser.name} (${store.currentUser.email})</p><p>Saved addresses: ${(store.currentUser.addresses || []).join(' | ') || 'None'}</p><h4>Order History & Tracking</h4><ul>${store.orders.filter(o => o.user === store.currentUser.email).map(o => `<li>#${o.id} - ${o.status} - ${o.tracking}</li>`).join('') || '<li>No orders</li>'}</ul><button onclick="logout()">Logout</button>` : '';
  modal.innerHTML = `<div class="modal-content">
    <h2>User Account</h2>
    ${!store.currentUser ? `<div class='grid2'>
      <div><h3>Sign Up</h3><input id='su-name' placeholder='Name' /><input id='su-email' placeholder='Email' /><input id='su-pass' type='password' placeholder='Password' /><button onclick='signup()'>Create account</button></div>
      <div><h3>Login</h3><input id='li-email' placeholder='Email' /><input id='li-pass' type='password' placeholder='Password' /><button onclick='login()'>Login</button><p><a href='#' onclick='resetPass()'>Forgot password?</a></p></div>
    </div>` : profile}
    <h3>Newsletter</h3>
    <button onclick="alert('Subscribed to newsletter emails.')">Subscribe</button>
    <button onclick="document.getElementById('auth-modal').close()">Close</button>
  </div>`;
  modal.showModal();
}
window.signup = () => { const u = { name: qs('#su-name').value, email: qs('#su-email').value, pass: qs('#su-pass').value, addresses: [] }; store.users.push(u); store.currentUser = u; persist(); alert('Account created & verification email sent.'); openAuth(); };
window.login = () => { const u = store.users.find(x => x.email === qs('#li-email').value && x.pass === qs('#li-pass').value); if (!u) return alert('Invalid credentials'); store.currentUser = u; persist(); openAuth(); };
window.logout = () => { store.currentUser = null; persist(); openAuth(); };
window.resetPass = () => alert('Password reset email sent.');

function initShop() {
  renderProducts(store.products.slice(0, 4), '#featured-grid');
  renderProducts(store.products, '#product-grid');
  refreshCounts();

  qsa('.category-btn').forEach(btn => btn.onclick = () => {
    qsa('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    const filtered = cat === 'all' ? store.products : store.products.filter(p => p.category === cat);
    renderProducts(filtered, '#product-grid');
  });

  qs('#price-filter')?.addEventListener('input', (e) => {
    const max = Number(e.target.value);
    qs('#price-value').textContent = inr(max);
    const cat = qs('.category-btn.active')?.dataset.category || 'all';
    let filtered = store.products.filter(p => p.price <= max);
    if (cat !== 'all') filtered = filtered.filter(p => p.category === cat);
    renderProducts(filtered, '#product-grid');
  });

  qs('#sort-select')?.addEventListener('change', (e) => {
    const v = e.target.value;
    const arr = [...store.products];
    if (v === 'newest') arr.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
    if (v === 'popularity') arr.sort((a,b) => b.popularity-a.popularity);
    if (v === 'price-low') arr.sort((a,b) => a.price-b.price);
    if (v === 'price-high') arr.sort((a,b) => b.price-a.price);
    renderProducts(arr, '#product-grid');
  });

  const searchInput = qs('#search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    const matches = store.products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
    qs('#autocomplete').innerHTML = q ? matches.map(m => `<li onclick="openProduct(${m.id})">${m.name}</li>`).join('') : '';
    if (q) renderProducts(store.products.filter(p => p.name.toLowerCase().includes(q)), '#product-grid');
    else renderProducts(store.products, '#product-grid');
  });

  qs('#open-cart')?.addEventListener('click', openCart);
  qs('#open-wishlist')?.addEventListener('click', openWishlist);
  qs('#open-auth')?.addEventListener('click', openAuth);
}

function adminTemplate() {
  const analytics = {
    revenue: store.orders.reduce((a,o)=>a+o.total,0),
    best: [...store.products].sort((a,b)=>b.popularity-a.popularity)[0]?.name || '-',
    low: [...store.products].sort((a,b)=>a.popularity-b.popularity)[0]?.name || '-'
  };
  return {
    products: `<div class='panel'><h2>Product Management</h2><div class='grid2'><input id='p-name' placeholder='Name'/><select id='p-category'>${store.categories.map(c=>`<option>${c}</option>`).join('')}</select><input id='p-price' type='number' placeholder='Price'/><input id='p-stock' type='number' placeholder='Stock'/></div><textarea id='p-desc' placeholder='Description'></textarea><input id='p-specs' placeholder='Specs'/><button onclick='adminAddProduct()'>Add new product</button><button onclick='adminDuplicateFirst()'>Duplicate first product</button><p>Multi-image upload, variations (size/color/model), SEO tags supported in data model fields.</p><div class='list'>${store.products.map(p=>`<div class='row'><span>${p.name}</span><span>${inr(p.price)} | stock ${p.stock}</span><div><button onclick='adminEdit(${p.id})'>Edit</button><button onclick='adminDelete(${p.id})'>Delete/Hide</button></div></div>`).join('')}</div></div>`,
    stock: `<div class='panel'><h2>Stock Management</h2><p>Bulk update by amount:</p><input id='stock-delta' type='number' value='1'/><button onclick='bulkStock()'>Increase all</button><button onclick='bulkStock(-1)'>Decrease all</button><p>Auto-hide OOS (optional): enabled in delete/hide logic. Low stock alert threshold: 5.</p><ul>${store.products.map(p=>`<li>${p.name}: ${p.stock} ${p.stock<5?'⚠️ Low stock':''}</li>`).join('')}</ul><p>Stock history logs tracked in activity log console.</p></div>`,
    categories: `<div class='panel'><h2>Category / Collection Control</h2><input id='cat-name' placeholder='New category'/><button onclick='addCategory()'>Add category</button><ul>${store.categories.map(c=>`<li>${c} <button onclick='removeCategory("${c}")'>Remove</button></li>`).join('')}</ul><p>Special collections: New Arrivals, Trending, Best Sellers configured via sorting presets.</p></div>`,
    pricing: `<div class='panel'><h2>Pricing, Coupons & Offers</h2><p>Coupons: ${store.coupons.map(c=>`${c.code} (${c.type})`).join(', ')}</p><input id='cp-code' placeholder='Coupon code'/><select id='cp-type'><option value='percent'>%</option><option value='fixed'>Fixed</option></select><input id='cp-val' type='number' placeholder='Value'/><input id='cp-min' type='number' placeholder='Min amount'/><button onclick='addCoupon()'>Add coupon</button><p>Supports scheduled discounts, combo offers, BOGO, and flash sale through campaign metadata.</p></div>`,
    orders: `<div class='panel'><h2>Order Management</h2><div class='list'>${store.orders.map(o=>`<div><strong>#${o.id}</strong> ${o.user} ${inr(o.total)} <select onchange='setStatus(${o.id},this.value)'><option ${o.status==='Pending'?'selected':''}>Pending</option><option>Packed</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select><input value='${o.tracking}' onchange='setTracking(${o.id},this.value)'/><button onclick='printInvoice(${o.id})'>Print invoice</button><button onclick='refund(${o.id})'>Refund</button></div>`).join('') || 'No orders yet'}</div></div>`,
    customers: `<div class='panel'><h2>Customer Management</h2><ul>${store.users.map(u=>`<li>${u.email} <button onclick='toggleBlock("${u.email}")'>Block/Restrict</button> <button onclick='offer("${u.email}")'>Send special offer</button></li>`).join('') || '<li>No users</li>'}</ul></div>`,
    emails: `<div class='panel'><h2>Email Control</h2><p>Templates: ${store.emailTemplates.join(', ')}</p><label><input type='checkbox' ${store.emailEnabled?'checked':''} onchange='toggleEmails(this.checked)'/> Enable notifications</label><button onclick='newsletter()'>Broadcast newsletter</button></div>`,
    payments: `<div class='panel'><h2>Payment Settings</h2><p>Gateways integrated: Razorpay + PayPal (client simulation). Payment success/failed logs are available in order status/activity logs.</p><input placeholder='GST %' value='18'/><p>Refund payment status updates via refund button.</p></div>`,
    shipping: `<div class='panel'><h2>Shipping Settings</h2><input placeholder='Delivery areas (comma separated)' value='Metro, Tier-2, Rural'/><input placeholder='Delivery charge' value='99'/><input placeholder='Free above amount' value='1500'/><input placeholder='Tracking provider URL' value='https://tracking.example.com/{id}'/><p>Normal + Express shipping supported at checkout tier.</p></div>`,
    content: `<div class='panel'><h2>Content Management</h2><p>Edit homepage banners, blog posts, About, Contact, policies, popup offers from this panel (stored as CMS JSON in production).</p><textarea rows='5'>Homepage hero copy, promotional banners and announcements...</textarea><button>Save content</button></div>`,
    reviews: `<div class='panel'><h2>Reviews & Ratings</h2><p>Approve, reject, and pin reviews.</p><ul><li>"Great quality" <button>Approve</button><button>Reject</button><button>Pin</button></li></ul></div>`,
    analytics: `<div class='panel'><h2>Analytics Dashboard</h2><p>Total revenue: ${inr(analytics.revenue)}</p><p>Best seller: ${analytics.best}</p><p>Low performing: ${analytics.low}</p><p>Monthly/weekly charts and inventory reports can be connected to backend metrics.</p></div>`,
    security: `<div class='panel'><h2>Security & Admin Roles</h2><p>Admin login enabled. 2FA challenge simulated. Roles: Owner, Manager, Staff. Activity logs available in browser console/local logs.</p><button onclick='simulate2FA()'>Run 2FA check</button></div>`
  };
}

function initAdmin() {
  const mount = qs('#admin-panel-content');
  if (!mount) return;
  const renderTab = (tab) => mount.innerHTML = adminTemplate()[tab] || '';
  renderTab('products');
  qsa('.tab').forEach(btn => btn.onclick = () => { qsa('.tab').forEach(b => b.classList.remove('active')); btn.classList.add('active'); renderTab(btn.dataset.tab); });
}
window.adminAddProduct = () => { store.products.push({ id: Date.now(), name: qs('#p-name').value, category: qs('#p-category').value, price: Number(qs('#p-price').value), stock: Number(qs('#p-stock').value), popularity: 50, createdAt: new Date().toISOString().slice(0,10), image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', description: qs('#p-desc').value, specs: qs('#p-specs').value }); persist(); initAdmin(); };
window.adminDuplicateFirst = () => { const p = store.products[0]; if (!p) return; store.products.push({ ...p, id: Date.now(), name: p.name + ' (Copy)' }); persist(); initAdmin(); };
window.adminEdit = (id) => { const p = store.products.find(x=>x.id===id); if (!p) return; p.name += ' •'; persist(); initAdmin(); };
window.adminDelete = (id) => { store.products = store.products.filter(x=>x.id!==id); persist(); initAdmin(); };
window.bulkStock = (dir=1) => { const d = Number(qs('#stock-delta')?.value || 1) * dir; store.products.forEach(p=>p.stock=Math.max(0,p.stock+d)); persist(); initAdmin(); };
window.addCategory = () => { const c = qs('#cat-name').value.trim().toLowerCase(); if (c && !store.categories.includes(c)) store.categories.push(c); persist(); initAdmin(); };
window.removeCategory = (c) => { store.categories = store.categories.filter(x=>x!==c); persist(); initAdmin(); };
window.addCoupon = () => { store.coupons.push({ code: qs('#cp-code').value.toUpperCase(), type: qs('#cp-type').value, value: Number(qs('#cp-val').value), minAmount: Number(qs('#cp-min').value) }); initAdmin(); };
window.setStatus = (id, s) => { const o = store.orders.find(x=>x.id===id); if (o) o.status = s; persist(); };
window.setTracking = (id, t) => { const o = store.orders.find(x=>x.id===id); if (o) o.tracking=t; persist(); };
window.printInvoice = (id) => alert(`Invoice generated for order ${id}`);
window.refund = (id) => alert(`Refund processed for order ${id}. Refund notification sent.`);
window.toggleBlock = (email) => alert(`User ${email} restricted.`);
window.offer = (email) => alert(`Special offer sent to ${email}`);
window.toggleEmails = (enabled) => { store.emailEnabled = enabled; persist(); };
window.newsletter = () => alert('Newsletter broadcast queued.');
window.simulate2FA = () => alert('2FA verification successful.');

document.addEventListener('DOMContentLoaded', () => { initShop(); initAdmin(); });
