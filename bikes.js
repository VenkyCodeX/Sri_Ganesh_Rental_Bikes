'use strict';

const API = window.location.hostname === 'localhost' ? '/api' : 'https://sri-ganesh-rental-bikes.onrender.com/api';

// ── LOADER ──
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2200);
});

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.background =
    window.scrollY > 50 ? 'rgba(13,18,32,0.99)' : 'rgba(13,18,32,0.95)';
});

// ── STATE ──
let bikes         = [];
let activeCat     = 'all';
let activeSort    = '';
let searchQuery   = '';
let currentBike   = null;
let selectedRating = 0;
let openTab       = 'book';

// ── HELPERS ──
function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating))   html += '<i class="fas fa-star"></i>';
    else if (i - rating < 1)       html += '<i class="fas fa-star-half-stroke"></i>';
    else                           html += '<i class="far fa-star"></i>';
  }
  return html;
}

function badgeClass(badge) {
  const map = { Popular: 'badge-popular', Hot: 'badge-hot', Premium: 'badge-premium', Available: 'badge-available', New: 'badge-new' };
  return map[badge] || 'badge-available';
}

// ── FETCH BIKES FROM API ──
async function loadBikes() {
  try {
    const params = new URLSearchParams();
    if (activeCat !== 'all') params.set('category', activeCat);
    if (activeSort)          params.set('sort', activeSort);
    if (searchQuery)         params.set('search', searchQuery);

    const res  = await fetch(`${API}/bikes?${params}`);
    bikes = await res.json();
    renderBikes();
  } catch (err) {
    console.error('Failed to load bikes:', err);
    const grid = document.getElementById('bikesGrid');
    grid.innerHTML = '';
    document.getElementById('noResults').classList.remove('hidden');
    document.getElementById('noResults').innerHTML =
      '<i class="fas fa-triangle-exclamation"></i><p>Could not load bikes. Make sure the server is running.</p>';
    document.getElementById('bikesCount').innerHTML = '';
  }
}

// ── RENDER ──
function renderBikes() {
  const grid    = document.getElementById('bikesGrid');
  const noRes   = document.getElementById('noResults');
  const counter = document.getElementById('bikesCount');

  counter.innerHTML = `Showing <span>${bikes.length}</span> bike${bikes.length !== 1 ? 's' : ''}`;

  if (!bikes.length) {
    grid.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  grid.innerHTML = bikes.map((b, i) => {
    const unavailable = b.status === 'rented' || b.status === 'maintenance';
    const overlayHTML = b.status === 'rented'
      ? `<div class="card-unavailable-overlay rented-overlay"><i class="fas fa-lock"></i><span>Currently Rented</span></div>`
      : b.status === 'maintenance'
      ? `<div class="card-unavailable-overlay maintenance-overlay"><i class="fas fa-wrench"></i><span>Under Maintenance</span></div>`
      : '';
    return `
    <div class="bike-card ${unavailable ? 'bike-unavailable' : ''}" style="animation-delay:${i * 0.06}s">
      <div class="card-img-wrap">
        <img src="${b.img}" alt="${b.name}" loading="lazy" />
        <span class="card-badge ${badgeClass(b.badge)}">${b.badge}</span>
        <span class="card-status status-${b.status}">${b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
        ${overlayHTML}
      </div>
      <div class="card-body">
        <div class="card-name">${b.name}</div>
        <div class="card-location"><i class="fas fa-location-dot"></i>${b.location}</div>
        <div class="card-meta">
          <div class="card-price">₹${b.price}<small>/day</small></div>
          <div class="card-rating">
            ${starsHTML(b.rating)}
            <span>(${b.reviews})</span>
          </div>
        </div>
        <div class="card-actions">
          ${unavailable
            ? `<button class="btn-unavailable" disabled>${b.status === 'rented' ? '<i class="fas fa-lock"></i> Currently Rented' : '<i class="fas fa-wrench"></i> Under Maintenance'}</button>`
            : `<button class="btn-book-card" onclick="openModal('${b._id}','book')">Book Now</button>
               <button class="btn-pay-card" onclick="openModal('${b._id}','pay')">Pay Now</button>`
          }
        </div>
      </div>
    </div>`;
  }).join('');
}

// ── FILTERS ──
document.getElementById('filterCats').addEventListener('click', e => {
  const btn = e.target.closest('.cat-btn');
  if (!btn) return;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeCat = btn.dataset.cat;
  loadBikes();
});

document.getElementById('sortSelect').addEventListener('change', e => {
  activeSort = e.target.value;
  loadBikes();
});

let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { searchQuery = e.target.value.trim(); loadBikes(); }, 300);
});

// ── MODAL ──
const overlay = document.getElementById('modalOverlay');

window.openModal = function (bikeId, mode) {
  currentBike = bikes.find(b => b._id === bikeId);
  if (!currentBike) return;
  if (currentBike.status === 'rented' || currentBike.status === 'maintenance') return;

  resetModal();
  populateBikeHeader();
  renderReviews();

  switchTab('book');
  showStep(1);
  if (mode === 'pay') {
    document.getElementById('proceedPayBtn').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalClose').addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

function resetModal() {
  ['custName', 'custPhone', 'startDate', 'endDate', 'upiId', 'cardNum', 'cardExpiry', 'cardCvv', 'cardName'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const pt = document.getElementById('pickupTime');
  if (pt) pt.value = '10:00';
  const tc = document.getElementById('termsCheck');
  if (tc) tc.checked = false;
  document.getElementById('sumDays').textContent  = '– days';
  document.getElementById('sumRate').textContent  = '₹–/day';
  document.getElementById('sumTotal').textContent = '₹–';
  selectedRating = 0;
  updateStarPicker(0);
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewText').value = '';
}

function populateBikeHeader() {
  document.getElementById('modalBikeHeader').innerHTML = `
    <img src="${currentBike.img}" alt="${currentBike.name}" />
    <div>
      <h3>${currentBike.name}</h3>
      <p><i class="fas fa-location-dot" style="color:var(--orange)"></i> ${currentBike.location}</p>
      <div class="price">₹${currentBike.price}/day</div>
    </div>
  `;
}

// ── TABS ──
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function switchTab(name) {
  openTab = name;
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('active', c.id === `tab-${name}`);
    c.classList.toggle('hidden', c.id !== `tab-${name}`);
  });
}

// ── STEPS ──
function showStep(n) {
  [1, 2, 3].forEach(i => document.getElementById(`step${i}`).classList.toggle('hidden', i !== n));
}

// ── DATE → SUMMARY ──
function calcSummary() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  if (!s || !e || !currentBike) return;
  const days  = Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
  const total = days * currentBike.price;
  document.getElementById('sumDays').textContent  = `${days} day${days > 1 ? 's' : ''}`;
  document.getElementById('sumRate').textContent  = `₹${currentBike.price}/day`;
  document.getElementById('sumTotal').textContent = `₹${total}`;
  return { days, total };
}

['startDate', 'endDate'].forEach(id => document.getElementById(id).addEventListener('change', calcSummary));

const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').min = today;
document.getElementById('endDate').min   = today;

// ── WHATSAPP BOOK ──
document.getElementById('waBookBtn').addEventListener('click', e => {
  e.preventDefault();
  if (!currentBike) return;
  const name  = document.getElementById('custName').value.trim() || 'Customer';
  const from  = document.getElementById('startDate').value || 'TBD';
  const to    = document.getElementById('endDate').value   || 'TBD';
  const time  = document.getElementById('pickupTime')?.value || '10:00';
  const days  = (from !== 'TBD' && to !== 'TBD') ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000)) : 1;
  const total = days * currentBike.price;
  const msg   = encodeURIComponent(`Hi, I want to rent *${currentBike.name}* from ${from} to ${to} (${days} day${days>1?'s':''}). Pickup time: ${time}. Total: \u20b9${total}. My name is ${name}. Please confirm. - Sri Ganesh Bike Rentals`);
  window.open(`https://wa.me/919100438272?text=${msg}`, '_blank');
});

// ── PROCEED TO PAY ──
document.getElementById('proceedPayBtn').addEventListener('click', () => {
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const from  = document.getElementById('startDate').value;
  const to    = document.getElementById('endDate').value;
  const terms = document.getElementById('termsCheck').checked;
  if (!name || !phone || !from || !to) { alert('Please fill in all fields before proceeding.'); return; }
  if (new Date(to) < new Date(from))   { alert('End date must be after start date.'); return; }
  if (!terms) { alert('Please agree to the Terms & Conditions before proceeding.'); return; }
  updatePayAmount();
  showStep(2);
});

function updatePayAmount() {
  const s = document.getElementById('startDate').value;
  const e = document.getElementById('endDate').value;
  let total = currentBike ? currentBike.price : 0;
  if (s && e && currentBike) {
    const days = Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000));
    total = days * currentBike.price;
  }
  document.getElementById('payAmountDisplay').textContent = `₹${total}`;
  return total;
}

// ── PAY TABS ──
document.querySelectorAll('.pay-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pay-content').forEach(c => { c.classList.add('hidden'); c.classList.remove('active'); });
    tab.classList.add('active');
    const content = document.getElementById(`pay-${tab.dataset.pay}`);
    content.classList.remove('hidden');
    content.classList.add('active');
  });
});

// ── CARD FORMAT ──
document.getElementById('cardNum').addEventListener('input', e => {
  e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
});
document.getElementById('cardExpiry').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
  e.target.value = v;
});

// ── PAY NOW → SAVE BOOKING TO API ──
document.getElementById('payNowBtn').addEventListener('click', async () => {
  const btn = document.getElementById('payNowBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';

  try {
    await saveBooking();
    showStep(3);
  } catch (err) {
    alert('Booking failed. Please try again.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
  }
});

async function saveBooking() {
  const s     = document.getElementById('startDate').value;
  const e     = document.getElementById('endDate').value;
  const days  = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
  const total = days * (currentBike ? currentBike.price : 0);
  const pickupTime = document.getElementById('pickupTime')?.value || '10:00';

  const activePayTab = document.querySelector('.pay-tab.active');
  const payMethod    = activePayTab ? activePayTab.dataset.pay : 'upi';

  const res = await fetch(`${API}/bookings`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer:   document.getElementById('custName').value.trim(),
      phone:      document.getElementById('custPhone').value.trim(),
      bike:       currentBike.name,
      bikeId:     currentBike._id,
      from:       s,
      to:         e,
      pickupTime,
      amount:     total,
      payMethod
    })
  });

  if (!res.ok) throw new Error('Booking API error');
  const booking = await res.json();
  document.getElementById('bookingIdDisplay').textContent = booking.bookingId;
}

document.getElementById('doneBtn').addEventListener('click', closeModal);

// ── REVIEWS ──
async function renderReviews() {
  if (!currentBike) return;
  const list = document.getElementById('reviewsList');
  list.innerHTML = '<div class="no-reviews"><i class="fas fa-spinner fa-spin"></i> Loading…</div>';

  try {
    const res     = await fetch(`${API}/reviews/${currentBike._id}`);
    const reviews = await res.json();

    if (!reviews.length) {
      list.innerHTML = '<div class="no-reviews">No reviews yet. Be the first!</div>';
      return;
    }

    list.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-avatar">${r.name.charAt(0).toUpperCase()}</div>
          <div class="review-meta">
            <strong>${r.name}</strong>
            <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          </div>
        </div>
        <p class="review-text">${r.text}</p>
      </div>
    `).join('');
  } catch {
    list.innerHTML = '<div class="no-reviews">Could not load reviews.</div>';
  }
}

// ── STAR PICKER ──
function updateStarPicker(val) {
  document.querySelectorAll('.stars-input i').forEach((star, i) => star.classList.toggle('active', i < val));
}

document.querySelectorAll('.stars-input i').forEach(star => {
  star.addEventListener('click',      () => { selectedRating = +star.dataset.val; updateStarPicker(selectedRating); });
  star.addEventListener('mouseenter', () => updateStarPicker(+star.dataset.val));
  star.addEventListener('mouseleave', () => updateStarPicker(selectedRating));
});

document.getElementById('submitReviewBtn').addEventListener('click', async () => {
  const name = document.getElementById('reviewName').value.trim();
  const text = document.getElementById('reviewText').value.trim();
  if (!name || !text || !selectedRating) { alert('Please fill in your name, rating, and review.'); return; }

  try {
    const res = await fetch(`${API}/reviews/${currentBike._id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rating: selectedRating, text })
    });
    if (!res.ok) throw new Error();
    document.getElementById('reviewName').value = '';
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    updateStarPicker(0);
    renderReviews();
  } catch {
    alert('Failed to submit review. Please try again.');
  }
});

// ── INIT ──
loadBikes();
