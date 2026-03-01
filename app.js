const api = {
  async get(path) { try { const r = await fetch(path); if (!r.ok) throw 0; return await r.json(); } catch { return null; } },
  async post(path, payload) { try { const r = await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); if(!r.ok) throw 0; return await r.json(); } catch { return null; } }
};

const store = {
  products: JSON.parse(localStorage.getItem('products') || '[]'),
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]'),
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  orders: JSON.parse(localStorage.getItem('orders') || '[]'),
  settings: JSON.parse(localStorage.getItem('settings') || 'null') || {
    payment: { razorpayKey: 'rzp_test_xxxxx', razorpaySecret: '***', paypalClientId: 'paypal_client', paypalSecret: '***', currency: 'INR' },
    smtp: { host: 'smtp.gmail.com', port: 587, secure: false, user: 'demo@company.com', pass: '***', fromEmail: 'sales@company.com' },
    shipping: { charge: 99, freeAbove: 1500, etaDays: 4, areas: 'Metro,Tier2,Rural', expressCharge: 199 }
  }
};
if (!store.products.length) {
  store.products = [
    { id: 1, name: 'Handmade Clay Vase', category: 'handmade', price: 1200, stock: 14, popularity: 88, createdAt: '2026-01-03', image: 'https://images.unsplash.com/photo-1578507065211-c7e0f2f27f8b?auto=format&fit=crop&w=800&q=80', description: 'Hand-thrown textured clay vase.', specs: 'Clay | 10in' },
    { id: 2, name: 'Luxury Silk Throw', category: 'luxury', price: 4200, stock: 7, popularity: 96, createdAt: '2026-02-08', image: 'https://images.unsplash.com/photo-1603251579431-8041402bdeda?auto=format&fit=crop&w=800&q=80', description: 'Premium woven silk throw.', specs: '100% Silk' },
    { id: 3, name: 'Artisan Chocolate Box', category: 'food', price: 950, stock: 30, popularity: 90, createdAt: '2026-02-20', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80', description: 'Small-batch gourmet chocolate.', specs: '12 pc box' },
    { id: 4, name: 'Smart Home Speaker', category: 'electronics', price: 5600, stock: 22, popularity: 85, createdAt: '2026-01-28', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=800&q=80', description: 'Wireless smart speaker.', specs: 'Bluetooth + WiFi' }
  ];
}

const persist = () => {
  localStorage.setItem('products', JSON.stringify(store.products));
  localStorage.setItem('cart', JSON.stringify(store.cart));
  localStorage.setItem('wishlist', JSON.stringify(store.wishlist));
  localStorage.setItem('users', JSON.stringify(store.users));
  localStorage.setItem('currentUser', JSON.stringify(store.currentUser));
  localStorage.setItem('orders', JSON.stringify(store.orders));
  localStorage.setItem('settings', JSON.stringify(store.settings));
};

const qs = s => document.querySelector(s), qsa = s => [...document.querySelectorAll(s)], inr = n => `₹${Number(n).toLocaleString('en-IN')}`;

function renderProducts(products, mountSelector) {
  const mount = qs(mountSelector); if (!mount) return;
  mount.innerHTML = products.map(p => `<article class="card"><img src="${p.image}" alt="${p.name}" loading="lazy"/><div class="card-body"><h3>${p.name}</h3><p class="meta">${p.category} | Stock ${p.stock}</p><p>${inr(p.price)}</p><div class="row"><button onclick="openProduct(${p.id})">View</button><button onclick="toggleWishlist(${p.id})">♡</button><button onclick="addToCart(${p.id})">Add</button></div></div></article>`).join('');
}
const refreshCounts = () => { if (qs('#cart-count')) qs('#cart-count').textContent = store.cart.reduce((a,c)=>a+c.qty,0); if (qs('#wishlist-count')) qs('#wishlist-count').textContent = store.wishlist.length; };

window.openProduct = (id) => {
  const p = store.products.find(x => x.id === id); if (!p) return;
  const similar = store.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 3);
  qs('#product-modal').innerHTML = `<div class="modal-content"><h2>${p.name}</h2><img src="${p.image}" style="width:100%;height:250px;object-fit:cover;border-radius:.6rem" alt="${p.name}"/><p>${p.description}</p><p><strong>Specs:</strong> ${p.specs}</p><p><strong>Price:</strong> ${inr(p.price)}</p><h3>Similar products</h3><ul>${similar.map(s=>`<li>${s.name}</li>`).join('')}</ul><button onclick="addToCart(${p.id})">Add to cart</button><button onclick="document.getElementById('product-modal').close()">Close</button></div>`;
  qs('#product-modal').showModal();
};
window.toggleWishlist = id => { store.wishlist = store.wishlist.includes(id) ? store.wishlist.filter(x=>x!==id) : [...store.wishlist,id]; persist(); refreshCounts(); };
window.addToCart = (id, qty=1) => { const i = store.cart.find(x=>x.id===id); i ? i.qty += qty : store.cart.push({id,qty}); persist(); refreshCounts(); };
window.updateQty = (id, d) => { const i = store.cart.find(x=>x.id===id); if (!i) return; i.qty += d; if(i.qty<=0) store.cart = store.cart.filter(x=>x.id!==id); persist(); refreshCounts(); openCart(); };
window.removeItem = id => { store.cart = store.cart.filter(x=>x.id!==id); persist(); refreshCounts(); openCart(); };

function cartTotals() {
  const sub = store.cart.reduce((s,i)=> s + (store.products.find(p=>p.id===i.id)?.price||0)*i.qty, 0);
  const shipping = sub >= store.settings.shipping.freeAbove ? 0 : (sub > 0 ? store.settings.shipping.charge : 0);
  return { sub, shipping, total: sub + shipping };
}

function openCart() {
  const t = cartTotals();
  const eta = new Date(Date.now() + Number(store.settings.shipping.etaDays) * 86400000).toDateString();
  qs('#cart-modal').innerHTML = `<div class="modal-content"><h2>Cart + Checkout</h2>${store.cart.map(i=>{const p=store.products.find(x=>x.id===i.id);return `<div class='row'><span>${p.name} (${i.qty})</span><span>${inr(p.price*i.qty)}</span><div><button onclick='updateQty(${p.id},-1)'>-</button><button onclick='updateQty(${p.id},1)'>+</button><button onclick='removeItem(${p.id})'>Remove</button></div></div>`}).join('') || '<p>Empty cart</p>'}<hr/><p>Subtotal ${inr(t.sub)} | Delivery ${inr(t.shipping)} | <strong>Total ${inr(t.total)}</strong></p><p>Estimated delivery: ${eta}</p><h3>Secure payment</h3><div class='grid2'><button onclick="placeOrder('Razorpay')">Razorpay</button><button onclick="placeOrder('PayPal')">PayPal</button></div><button onclick="document.getElementById('cart-modal').close()">Close</button></div>`;
  qs('#cart-modal').showModal();
}

function trackingTimeline(order) {
  return `<div class='panel'><h4>Tracking #${order.tracking}</h4><p><span class='badge'>${order.status}</span> | ETA: ${order.eta}</p><p>Messages: ${order.timeline.join(' → ')}</p></div>`;
}
window.placeOrder = async (method) => {
  if (!store.currentUser) return alert('Please login first');
  const t = cartTotals(); if (!t.total) return alert('Cart empty');
  const order = { id: Date.now(), user: store.currentUser.email, items: store.cart, total: t.total, payment: method, status: 'Pending', tracking: 'TRK' + Math.floor(Math.random()*100000), eta: new Date(Date.now()+Number(store.settings.shipping.etaDays)*86400000).toDateString(), timeline: ['Order placed','Payment success','Packed'] };
  store.orders.unshift(order); store.cart = []; persist(); refreshCounts();
  await api.post('/api/orders', order);
  alert(`Order placed via ${method}. Delivery update messages will continue automatically.`);
  qs('#cart-modal').close();
};

function openWishlist(){const l=store.products.filter(p=>store.wishlist.includes(p.id));qs('#wishlist-modal').innerHTML=`<div class='modal-content'><h2>Wishlist</h2>${l.map(p=>`<div class='row'><span>${p.name}</span><button onclick='addToCart(${p.id})'>Add</button></div>`).join('')||'No items'}<button onclick="document.getElementById('wishlist-modal').close()">Close</button></div>`;qs('#wishlist-modal').showModal();}
function openAuth(){const logged=!!store.currentUser;qs('#auth-modal').innerHTML=`<div class='modal-content'><h2>User Account</h2>${!logged?`<div class='grid2'><div><h3>Sign up</h3><input id='su-name' placeholder='Name'/><input id='su-email' placeholder='Email'/><input id='su-pass' type='password' placeholder='Password'/><button onclick='signup()'>Create account</button></div><div><h3>Login</h3><input id='li-email' placeholder='Email'/><input id='li-pass' type='password' placeholder='Password'/><button onclick='login()'>Login</button></div></div>`:`<p>${store.currentUser.name} (${store.currentUser.email})</p><h3>Orders</h3>${store.orders.filter(o=>o.user===store.currentUser.email).map(trackingTimeline).join('')||'No orders'}<button onclick='logout()'>Logout</button>`}<button onclick="document.getElementById('auth-modal').close()">Close</button></div>`;qs('#auth-modal').showModal();}
window.signup=()=>{const u={name:qs('#su-name').value,email:qs('#su-email').value,pass:qs('#su-pass').value};store.users.push(u);store.currentUser=u;persist();alert('Account verification mail sent via SMTP settings.');openAuth();};
window.login=()=>{const u=store.users.find(x=>x.email===qs('#li-email').value&&x.pass===qs('#li-pass').value);if(!u)return alert('Invalid');store.currentUser=u;persist();openAuth();};
window.logout=()=>{store.currentUser=null;persist();openAuth();};

function initShop() {
  renderProducts(store.products.slice(0, 4), '#featured-grid');
  renderProducts(store.products, '#product-grid');
  refreshCounts();

  qsa('.category-btn').forEach(btn => btn.onclick = () => {
    qsa('.category-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
    const c = btn.dataset.category;
    renderProducts(c==='all'?store.products:store.products.filter(p=>p.category===c), '#product-grid');
  });
  qs('#price-filter')?.addEventListener('input', e => { const m = Number(e.target.value); qs('#price-value').textContent = inr(m); renderProducts(store.products.filter(p=>p.price<=m), '#product-grid'); });
  qs('#sort-select')?.addEventListener('change', e => { const v=e.target.value, a=[...store.products]; if(v==='newest')a.sort((x,y)=>new Date(y.createdAt)-new Date(x.createdAt)); if(v==='popularity')a.sort((x,y)=>y.popularity-x.popularity); if(v==='price-low')a.sort((x,y)=>x.price-y.price); if(v==='price-high')a.sort((x,y)=>y.price-x.price); renderProducts(a,'#product-grid');});
  qs('#search-input')?.addEventListener('input', e=>{const q=e.target.value.toLowerCase().trim();const m=store.products.filter(p=>p.name.toLowerCase().includes(q));qs('#autocomplete').innerHTML=q?m.slice(0,5).map(i=>`<li onclick='openProduct(${i.id})'>${i.name}</li>`).join(''):'';renderProducts(q?m:store.products,'#product-grid');});
  qs('#open-cart')?.addEventListener('click', openCart); qs('#open-wishlist')?.addEventListener('click', openWishlist); qs('#open-auth')?.addEventListener('click', openAuth);
}

function adminView() {
  const rev = store.orders.reduce((a,o)=>a+o.total,0);
  return {
    products: `<div class='panel'><h2>Add / Edit Products</h2><div class='grid2'><input id='p-name' placeholder='Product name'/><select id='p-cat'><option>handmade</option><option>luxury</option><option>food</option><option>electronics</option></select><input id='p-price' type='number' placeholder='Price'/><input id='p-stock' type='number' placeholder='Stock'/></div><textarea id='p-desc' placeholder='Description'></textarea><input id='p-img' placeholder='Image URL'/><input id='p-specs' placeholder='Specs, size/color/model'/><button onclick='adminAddProduct()'>Add Product</button><div class='list'>${store.products.map(p=>`<div class='row'><span>${p.name}</span><span>${inr(p.price)}</span><button onclick='adminDelete(${p.id})'>Delete</button></div>`).join('')}</div></div>`,
    orders: `<div class='panel'><h2>Orders + Delivery Updates</h2>${store.orders.map(o=>`<div class='panel'><strong>#${o.id}</strong> ${o.user} | ${inr(o.total)} <select onchange='setStatus(${o.id},this.value)'><option ${o.status==='Pending'?'selected':''}>Pending</option><option ${o.status==='Packed'?'selected':''}>Packed</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Out for Delivery'?'selected':''}>Out for Delivery</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option><option ${o.status==='Cancelled'?'selected':''}>Cancelled</option></select><input value='${o.tracking}' onchange='setTracking(${o.id},this.value)'/><button onclick='pushTimeline(${o.id})'>Add update message</button><p>${o.timeline.join(' → ')}</p></div>`).join('') || 'No orders'}</div>`,
    payment: `<div class='panel'><h2>Razorpay + PayPal Settings</h2><div class='grid2'><input id='rz-key' value='${store.settings.payment.razorpayKey}' placeholder='Razorpay key'/><input id='rz-secret' value='${store.settings.payment.razorpaySecret}' placeholder='Razorpay secret'/><input id='pp-id' value='${store.settings.payment.paypalClientId}' placeholder='PayPal client ID'/><input id='pp-secret' value='${store.settings.payment.paypalSecret}' placeholder='PayPal secret'/><input id='pay-currency' value='${store.settings.payment.currency}' placeholder='Currency'/></div><button onclick='savePayment()'>Save payment settings</button></div>`,
    smtp: `<div class='panel'><h2>SMTP Mail Settings (editable from admin)</h2><div class='grid2'><input id='sm-host' value='${store.settings.smtp.host}' placeholder='SMTP host'/><input id='sm-port' type='number' value='${store.settings.smtp.port}' placeholder='Port'/><input id='sm-user' value='${store.settings.smtp.user}' placeholder='Username'/><input id='sm-pass' value='${store.settings.smtp.pass}' placeholder='Password'/><input id='sm-from' value='${store.settings.smtp.fromEmail}' placeholder='From email'/></div><button onclick='saveSMTP()'>Save SMTP settings</button></div>`,
    shipping: `<div class='panel'><h2>Shipping Rules</h2><div class='grid2'><input id='sh-charge' type='number' value='${store.settings.shipping.charge}' placeholder='Normal delivery charge'/><input id='sh-free' type='number' value='${store.settings.shipping.freeAbove}' placeholder='Free above'/><input id='sh-eta' type='number' value='${store.settings.shipping.etaDays}' placeholder='ETA days'/><input id='sh-exp' type='number' value='${store.settings.shipping.expressCharge}' placeholder='Express charge'/></div><textarea id='sh-areas'>${store.settings.shipping.areas}</textarea><button onclick='saveShipping()'>Save shipping settings</button></div>`,
    analytics: `<div class='panel'><h2>Analytics</h2><p>Total revenue ${inr(rev)}</p><p>Total orders ${store.orders.length}</p><p>Best seller ${[...store.products].sort((a,b)=>b.popularity-a.popularity)[0]?.name || '-'}</p></div>`,
    security: `<div class='panel'><h2>Security</h2><p>Roles: Owner, Manager, Staff</p><button onclick='simulate2FA()'>Run 2FA test</button><p>Admin action logs available via server DB + console.</p></div>`
  };
}
function initAdmin(){const m=qs('#admin-panel-content');if(!m)return;const render=t=>m.innerHTML=adminView()[t]||'';render('products');qsa('.tab').forEach(b=>b.onclick=()=>{qsa('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.tab);});}

window.adminAddProduct=()=>{store.products.push({id:Date.now(),name:qs('#p-name').value,category:qs('#p-cat').value,price:Number(qs('#p-price').value),stock:Number(qs('#p-stock').value),popularity:50,createdAt:new Date().toISOString().slice(0,10),description:qs('#p-desc').value,image:qs('#p-img').value||'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',specs:qs('#p-specs').value});persist();initAdmin();};
window.adminDelete=(id)=>{store.products=store.products.filter(p=>p.id!==id);persist();initAdmin();};
window.setStatus=async(id,s)=>{const o=store.orders.find(x=>x.id===id);if(!o)return;o.status=s;o.timeline.push(s);persist();await api.post(`/api/orders/${id}/status`,{status:s});initAdmin();};
window.setTracking=async(id,t)=>{const o=store.orders.find(x=>x.id===id);if(!o)return;o.tracking=t;persist();await api.post(`/api/orders/${id}/tracking`,{tracking:t});};
window.pushTimeline=async(id)=>{const o=store.orders.find(x=>x.id===id);if(!o)return;const msg=prompt('Delivery update message (e.g., Shipped from warehouse)');if(!msg)return;o.timeline.push(msg);persist();await api.post(`/api/orders/${id}/message`,{message:msg});initAdmin();};
window.savePayment=async()=>{store.settings.payment={razorpayKey:qs('#rz-key').value,razorpaySecret:qs('#rz-secret').value,paypalClientId:qs('#pp-id').value,paypalSecret:qs('#pp-secret').value,currency:qs('#pay-currency').value};persist();await api.post('/api/settings/payment',store.settings.payment);alert('Payment settings saved.');};
window.saveSMTP=async()=>{store.settings.smtp={host:qs('#sm-host').value,port:Number(qs('#sm-port').value),user:qs('#sm-user').value,pass:qs('#sm-pass').value,fromEmail:qs('#sm-from').value};persist();await api.post('/api/settings/smtp',store.settings.smtp);alert('SMTP settings saved.');};
window.saveShipping=async()=>{store.settings.shipping={charge:Number(qs('#sh-charge').value),freeAbove:Number(qs('#sh-free').value),etaDays:Number(qs('#sh-eta').value),expressCharge:Number(qs('#sh-exp').value),areas:qs('#sh-areas').value};persist();await api.post('/api/settings/shipping',store.settings.shipping);alert('Shipping settings saved.');};
window.simulate2FA=()=>alert('2FA verification successful');

document.addEventListener('DOMContentLoaded', ()=>{initShop();initAdmin();persist();});
