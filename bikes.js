'use strict';

const API = window.location.hostname === 'localhost' ? '/api' : 'https://sriganeshrentalbikes-production.up.railway.app/api';

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// ── NAVBAR SCROLL (hide on down, show on up) ──
let lastScrollY = 0;
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > lastScrollY && current > 80) {
    navbar.style.transform = 'translateY(-100%)';
  } else {
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = current;
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
        ${b.payAtPickup === 'Yes' ? '<span class="card-pay-pickup"><i class="fas fa-circle-check"></i> Pay at Pickup</span>' : ''}
        ${overlayHTML}
      </div>
      <div class="card-body">
        <div class="card-name">${b.name}</div>
        ${b.bikeNumber ? `<div class="card-bike-number"><i class="fas fa-hashtag"></i> ${b.bikeNumber}</div>` : ''}
        <div class="card-location"><i class="fas fa-location-dot"></i>${b.location}</div>

        <div class="card-specs">
          ${b.transmission ? `<span><i class="fas fa-gears"></i> ${b.transmission}</span>` : ''}
          ${b.seats ? `<span><i class="fas fa-users"></i> ${b.seats} Seater</span>` : ''}
          ${b.fuelType ? `<span><i class="fas fa-gas-pump"></i> ${b.fuelType}</span>` : ''}
          ${b.manufacturedYear ? `<span><i class="fas fa-calendar"></i> ${b.manufacturedYear}</span>` : ''}
        </div>

        ${b.availableAt ? `<div class="card-available-at"><span>Available at</span><p>${b.availableAt}</p></div>` : ''}

        <div class="card-meta">
          <div>
            <div class="card-price">&#8377;${b.price}<small>/day</small></div>
            ${b.kmLimit ? `<div class="card-km">${b.kmLimit} Km limit</div>` : ''}
            ${b.extraChargePerKm ? `<div class="card-km">Extra: &#8377;${b.extraChargePerKm}/Km</div>` : ''}
            ${b.fuelIncluded ? `<div class="card-km">${b.fuelIncluded}</div>` : ''}
          </div>
          <div class="card-rating">
            ${starsHTML(b.rating)}
            <span>(${b.reviews})</span>
          </div>
        </div>

        ${b.deposit ? `<div class="card-deposit">Deposit : &#8377;${b.deposit}</div>` : ''}

        <div class="card-actions">
          ${unavailable
            ? `<button class="btn-unavailable" disabled>${b.status === 'rented' ? '<i class="fas fa-lock"></i> Currently Rented' : '<i class="fas fa-wrench"></i> Under Maintenance'}</button>`
            : `<button class="btn-pay-card" onclick="openModal('${b._id}','book')"><i class="fas fa-motorcycle"></i> Rent Now</button>`
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
function showStep(n, type) {
  ['step1','step2','step2cash','step3'].forEach(id => document.getElementById(id).classList.add('hidden'));
  if (n === 1) document.getElementById('step1').classList.remove('hidden');
  else if (n === 2 && type === 'cash') document.getElementById('step2cash').classList.remove('hidden');
  else if (n === 2) document.getElementById('step2').classList.remove('hidden');
  else if (n === 3) document.getElementById('step3').classList.remove('hidden');
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

// ── UPI APP DEEP LINKS ──
function setUpiLinks(amount) {
  const upiId = '9100438272@upi';
  const note  = encodeURIComponent('Sri Ganesh Bike Rental');
  document.getElementById('gpayBtn').href    = `upi://pay?pa=${upiId}&pn=SriGaneshBikeRentals&am=${amount}&cu=INR&tn=${note}`;
  document.getElementById('phonepeBtn').href = `upi://pay?pa=${upiId}&pn=SriGaneshBikeRentals&am=${amount}&cu=INR&tn=${note}`;
  document.getElementById('paytmBtn').href   = `upi://pay?pa=${upiId}&pn=SriGaneshBikeRentals&am=${amount}&cu=INR&tn=${note}`;
}

// ── PROCEED BUTTON ──
document.getElementById('proceedPayBtn').addEventListener('click', () => {
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const from  = document.getElementById('startDate').value;
  const to    = document.getElementById('endDate').value;
  const terms = document.getElementById('termsCheck').checked;
  if (!name || !phone || !from || !to) { alert('Please fill in all fields before proceeding.'); return; }
  if (new Date(to) < new Date(from))   { alert('End date must be after start date.'); return; }
  if (!terms) { alert('Please agree to the Terms & Conditions before proceeding.'); return; }

  const payMethod = document.getElementById('payAtPickup').value;

  if (payMethod === 'cash') {
    // Build cash order summary
    const s = document.getElementById('startDate').value;
    const e = document.getElementById('endDate').value;
    const days  = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
    const total = days * (currentBike ? currentBike.price : 0);
    const time  = document.getElementById('pickupTime').value || '10:00';
    document.getElementById('cashOrderSummary').innerHTML = `
      <div class="cash-summary-card">
        <div class="cash-bike-row">
          <img src="${currentBike.img}" alt="${currentBike.name}" />
          <div>
            <div class="cash-bike-name">${currentBike.name}</div>
            <div class="cash-bike-cat">${currentBike.category} ${currentBike.engine ? '&bull; ' + currentBike.engine : ''}</div>
          </div>
        </div>
        <div class="cash-rows">
          <div class="cash-row"><span>Customer</span><span>${name}</span></div>
          <div class="cash-row"><span>Phone</span><span>${phone}</span></div>
          <div class="cash-row"><span>From</span><span>${s}</span></div>
          <div class="cash-row"><span>To</span><span>${e}</span></div>
          <div class="cash-row"><span>Pickup Time</span><span>${time}</span></div>
          <div class="cash-row"><span>Duration</span><span>${days} day${days>1?'s':''}</span></div>
          ${currentBike.kmLimit ? `<div class="cash-row"><span>KM Limit</span><span>${currentBike.kmLimit} km/day</span></div>` : ''}
          ${currentBike.fuelIncluded ? `<div class="cash-row"><span>Fuel</span><span>${currentBike.fuelIncluded}</span></div>` : ''}
          ${currentBike.deposit ? `<div class="cash-row"><span>Deposit</span><span>&#8377;${currentBike.deposit}</span></div>` : ''}
          <div class="cash-row total"><span>Total Rent</span><span>&#8377;${total}</span></div>
        </div>
        <div class="cash-pay-label"><i class="fas fa-hand-holding-dollar"></i> Pay &#8377;${total} in cash at pickup</div>
      </div>`;
    showStep(2, 'cash');
  } else {
    updatePayAmount();
    showStep(2);
  }
});

// Back buttons
document.getElementById('backToStep1').addEventListener('click', () => showStep(1));
document.getElementById('backToStep1Cash').addEventListener('click', () => showStep(1));

// ── CASH CONFIRM ──
document.getElementById('confirmCashBtn').addEventListener('click', async () => {
  const btn = document.getElementById('confirmCashBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Confirming…';
  try {
    await saveBooking('cash');
    const name  = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const from  = document.getElementById('startDate').value;
    const to    = document.getElementById('endDate').value;
    const time  = document.getElementById('pickupTime').value || '10:00';
    const days  = from && to ? Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000)) : 1;
    const total = days * (currentBike ? currentBike.price : 0);
    // Set success screen
    document.getElementById('successTitle').textContent = 'Order Confirmed!';
    document.getElementById('successMsg').textContent = 'Your booking is confirmed. Pay cash at pickup.';
    // Build WhatsApp message
    const msg = encodeURIComponent(
      `Hi Sri Ganesh Bike Rentals!\n\n` +
      `*New Booking (Cash on Pickup)*\n` +
      `Bike: ${currentBike.name}\n` +
      `Customer: ${name}\n` +
      `Phone: ${phone}\n` +
      `From: ${from}  To: ${to}\n` +
      `Pickup Time: ${time}\n` +
      `Duration: ${days} day${days>1?'s':''}\n` +
      `Total: \u20b9${total}\n` +
      `Payment: Cash on Pickup\n` +
      `Booking ID: ${document.getElementById('bookingIdDisplay').textContent}`
    );
    document.getElementById('waSuccessBtn').href = `https://wa.me/919100438272?text=${msg}`;
    showStep(3);
    // Auto-open WhatsApp after 1.5s
    setTimeout(() => window.open(`https://wa.me/919100438272?text=${msg}`, '_blank'), 1500);
  } catch (err) {
    alert('Booking failed. Please try again.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Order';
  }
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
  setUpiLinks(total);
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

// ── PAY NOW → CASHFREE PAYMENT ──
document.getElementById('payNowBtn').addEventListener('click', async () => {
  const btn = document.getElementById('payNowBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing…';
  try {
    await handleOnlinePayment();
  } catch (err) {
    alert('Payment failed. Please try again.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
  }
});

async function handleOnlinePayment() {
  const s     = document.getElementById('startDate').value;
  const e     = document.getElementById('endDate').value;
  const days  = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
  const total = days * (currentBike ? currentBike.price : 0);
  const name  = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const time  = document.getElementById('pickupTime')?.value || '10:00';

  // Create Cashfree order
  const orderRes = await fetch(`${API}/payments/create-order`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount:     total,
      customer:   name,
      phone,
      bike:       currentBike.name,
      bikeId:     currentBike._id,
      from:       s,
      to:         e,
      pickupTime: time
    })
  });
  if (!orderRes.ok) throw new Error('Failed to create payment order');
  const orderData = await orderRes.json();

  const bookingData = {
    customer: name, phone,
    bike:     currentBike.name,
    bikeId:   currentBike._id,
    from: s, to: e, pickupTime: time,
    amount:   total, payMethod: 'cashfree'
  };

  // Load Cashfree SDK and open checkout
  const cashfree = await load({ mode: 'sandbox' });
  const checkoutOptions = {
    paymentSessionId: orderData.payment_session_id,
    returnUrl: `${window.location.origin}/bikes.html?order_id=${orderData.order_id}`,
  };

  cashfree.checkout(checkoutOptions).then(async result => {
    if (result.error) {
      alert('Payment failed: ' + result.error.message);
      return;
    }
    // Verify payment
    const verifyRes = await fetch(`${API}/payments/verify-payment`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderData.order_id, bookingData })
    });
    if (!verifyRes.ok) throw new Error('Verification failed');
    const result2 = await verifyRes.json();

    document.getElementById('successTitle').textContent = 'Payment Successful!';
    document.getElementById('successMsg').textContent = "Your bike has been booked. We'll contact you shortly.";
    document.getElementById('bookingIdDisplay').textContent = result2.booking?.bookingId || orderData.order_id;

    const msg = encodeURIComponent(
      `Hi Sri Ganesh Bike Rentals!\n\n*New Booking (Online Payment)*\nBike: ${currentBike.name}\nCustomer: ${name}\nPhone: ${phone}\nFrom: ${s}  To: ${e}\nPickup: ${time}\nDuration: ${days} day${days>1?'s':''}\nTotal: \u20b9${total}\nPayment: Cashfree Online\nBooking ID: ${result2.booking?.bookingId || orderData.order_id}`
    );
    document.getElementById('waSuccessBtn').href = `https://wa.me/919100438272?text=${msg}`;
    showStep(3);
  });
}

async function saveBooking(payMethodOverride) {
  const s     = document.getElementById('startDate').value;
  const e     = document.getElementById('endDate').value;
  const days  = s && e ? Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000)) : 1;
  const total = days * (currentBike ? currentBike.price : 0);
  const pickupTime = document.getElementById('pickupTime')?.value || '10:00';
  const payMethod  = payMethodOverride || document.getElementById('payAtPickup').value;

  const res = await fetch(`${API}/bookings`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer:   document.getElementById('custName').value.trim(),
      phone:      document.getElementById('custPhone').value.trim(),
      bike:       currentBike.name,
      bikeId:     currentBike._id,
      from:       s, to: e, pickupTime,
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
