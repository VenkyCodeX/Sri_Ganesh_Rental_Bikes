'use strict';

const API = '/api';

// ── HELPERS ──
const $       = id => document.getElementById(id);
const getToken = () => sessionStorage.getItem('sg_admin_token');

function showToast(msg, type = 'success') {
  const t = $('toast');
  t.querySelector('i').className = type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-xmark';
  t.className = `toast ${type}`;
  $('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function fmtDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusBadge(s) {
  const map = { available: 'badge-green', rented: 'badge-red', maintenance: 'badge-yellow', confirmed: 'badge-blue', pending: 'badge-yellow', cancelled: 'badge-red' };
  return `<span class="badge ${map[s] || 'badge-blue'}">${s.charAt(0).toUpperCase() + s.slice(1)}</span>`;
}

async function apiFetch(url, opts = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) { logout(); return null; }
  return res;
}

// ── AUTH ──
const loginOverlay = $('adminLoginOverlay');

// Check existing session
if (getToken()) loginOverlay.classList.add('hidden');

$('adminPassBtn').addEventListener('click', async () => {
  const email    = $('adminEmailInput').value.trim();
  const password = $('adminPassInput').value.trim();
  if (!email || !password) return;

  $('adminPassBtn').disabled = true;
  $('adminPassBtn').textContent = 'Logging in…';

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok || data.user?.role !== 'admin') {
      $('adminPassError').style.display = 'block';
      $('adminPassInput').value = '';
      $('adminPassInput').focus();
    } else {
      sessionStorage.setItem('sg_admin_token', data.token);
      loginOverlay.classList.add('hidden');
      renderDashboard();
    }
  } catch {
    $('adminPassError').textContent = 'Server error. Is the backend running?';
    $('adminPassError').style.display = 'block';
  } finally {
    $('adminPassBtn').disabled = false;
    $('adminPassBtn').textContent = 'Login';
  }
});

$('adminPassInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('adminPassBtn').click(); });
$('adminEmailInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('adminPassBtn').click(); });

function logout() {
  sessionStorage.removeItem('sg_admin_token');
  loginOverlay.classList.remove('hidden');
}

$('logoutBtn').addEventListener('click', e => { e.preventDefault(); logout(); });

// ── NAVIGATION ──
const pages = { dashboard: 'Dashboard', 'add-bike': 'Add Bike', 'manage-bikes': 'Manage Bikes', bookings: 'Bookings', payments: 'Payments' };

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    $(`page-${page}`).classList.add('active');
    $('topbarTitle').textContent = pages[page];
    $('sidebar').classList.remove('open');
    loadPage(page);
  });
});

$('menuToggle').addEventListener('click', () => $('sidebar').classList.toggle('open'));

function loadPage(page) {
  if (page === 'dashboard')    renderDashboard();
  if (page === 'manage-bikes') renderManageBikes();
  if (page === 'bookings')     renderBookings();
  if (page === 'payments')     renderPayments();
}

// ── DASHBOARD ──
async function renderDashboard() {
  try {
    const [bikesRes, statsRes, bookingsRes] = await Promise.all([
      apiFetch(`${API}/bikes`),
      apiFetch(`${API}/bookings/stats`),
      apiFetch(`${API}/bookings`)
    ]);
    if (!bikesRes || !statsRes || !bookingsRes) return;

    const bikes    = await bikesRes.json();
    const stats    = await statsRes.json();
    const bookings = await bookingsRes.json();

    $('dashStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-motorcycle"></i></div>
        <div><div class="stat-val">${bikes.length}</div><div class="stat-lbl">Total Bikes</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-calendar-check"></i></div>
        <div><div class="stat-val">${stats.total}</div><div class="stat-lbl">Total Bookings</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-indian-rupee-sign"></i></div>
        <div><div class="stat-val">₹${stats.revenue.toLocaleString('en-IN')}</div><div class="stat-lbl">Total Revenue</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i class="fas fa-circle-check"></i></div>
        <div><div class="stat-val">${stats.confirmed}</div><div class="stat-lbl">Confirmed</div></div>
      </div>
    `;

    const recent = bookings.slice(0, 5);
    const tbody  = $('recentBookingsTbody');
    if (!recent.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:32px">No bookings yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = recent.map(b => `
      <tr>
        <td><code style="color:var(--orange);font-size:12px">${b.bookingId}</code></td>
        <td>${b.customer || '–'}</td>
        <td>${b.bike || '–'}</td>
        <td>${fmtDate(b.from)}</td>
        <td>${fmtDate(b.to)}</td>
        <td style="color:#4ade80;font-weight:600">₹${(b.amount || 0).toLocaleString('en-IN')}</td>
        <td>${statusBadge(b.status || 'confirmed')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Dashboard error:', err);
  }
}

// ── ADD BIKE ──
$('bikeImgUrl').addEventListener('input', e => {
  const url  = e.target.value.trim();
  const wrap = $('imgPreviewWrap');
  wrap.innerHTML = url
    ? `<img src="${url}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=placeholder><i class=fas\\ fa-image></i>Invalid URL</div>'" />`
    : `<div class="placeholder"><i class="fas fa-image"></i>Image preview</div>`;
});

$('bikeImgFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    $('imgPreviewWrap').innerHTML = `<img src="${ev.target.result}" alt="Preview" />`;
    // store file reference, not base64
    $('bikeImgFile')._file = file;
  };
  reader.readAsDataURL(file);
});

$('addBikeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding…';

  try {
    let imgUrl = $('bikeImgUrl').value.trim() || 'assets/placeholder.svg';
    const fileInput = $('bikeImgFile');
    if (fileInput._file) {
      const fd = new FormData();
      fd.append('image', fileInput._file);
      const upRes = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd
      });
      if (!upRes.ok) throw new Error('Image upload failed');
      const upData = await upRes.json();
      imgUrl = upData.url;
      fileInput._file = null;
    }

    const payload = {
      name:     $('bikeName').value.trim(),
      category: $('bikeCategory').value,
      price:    +$('bikePrice').value,
      location: $('bikeLocation').value.trim(),
      engine:   $('bikeEngine').value.trim(),
      status:   $('bikeStatus').value,
      img:      imgUrl,
      desc:     $('bikeDesc').value.trim()
    };

    const res = await apiFetch(`${API}/bikes`, { method: 'POST', body: JSON.stringify(payload) });
    if (!res) return;
    if (!res.ok) { const d = await res.json(); showToast(d.message || 'Error adding bike', 'error'); return; }
    const bike = await res.json();
    $('addBikeForm').reset();
    $('imgPreviewWrap').innerHTML = `<div class="placeholder"><i class="fas fa-image"></i>Image preview</div>`;
    showToast(`"${bike.name}" added successfully!`);
  } catch (err) {
    showToast(err.message || 'Failed to add bike', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-plus"></i> Add Bike';
  }
});

// ── MANAGE BIKES ──
async function renderManageBikes(query = '') {
  const params = query ? `?search=${encodeURIComponent(query)}` : '';
  try {
    const res   = await apiFetch(`${API}/bikes${params}`);
    if (!res) return;
    const bikes = await res.json();

    $('manageBikeCount').textContent = `${bikes.length} bike${bikes.length !== 1 ? 's' : ''}`;
    const tbody = $('manageBikesTbody');
    const empty = $('manageBikesEmpty');

    if (!bikes.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    tbody.innerHTML = bikes.map(b => `
      <tr>
        <td><img class="table-img" src="${b.img}" alt="${b.name}" /></td>
        <td style="font-weight:600">${b.name}</td>
        <td><span class="badge badge-orange">${b.category}</span></td>
        <td style="color:#4ade80;font-weight:600">₹${b.price}/day</td>
        <td>${b.location}</td>
        <td>${statusBadge(b.status)}</td>
        <td>
          <button class="btn-icon btn-edit"   onclick="openEditModal('${b._id}')" title="Edit"><i class="fas fa-pen"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteBike('${b._id}')"   title="Delete" style="margin-left:6px"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Manage bikes error:', err);
  }
}

let searchTimer;
$('manageBikeSearch').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderManageBikes(e.target.value.trim()), 300);
});

window.deleteBike = async function (id) {
  if (!confirm('Delete this bike? This cannot be undone.')) return;
  try {
    const res = await apiFetch(`${API}/bikes/${id}`, { method: 'DELETE' });
    if (!res) return;
    if (!res.ok) { showToast('Failed to delete bike', 'error'); return; }
    renderManageBikes($('manageBikeSearch').value.trim());
    showToast('Bike deleted.', 'error');
  } catch {
    showToast('Failed to delete bike', 'error');
  }
};

// ── EDIT MODAL ──
window.openEditModal = async function (id) {
  try {
    const res  = await apiFetch(`${API}/bikes/${id}`);
    if (!res) return;
    const bike = await res.json();
    if (!bike || bike.message) return;

    $('editBikeId').value       = bike._id;
    $('editBikeName').value     = bike.name;
    $('editBikeCategory').value = bike.category;
    $('editBikePrice').value    = bike.price;
    $('editBikeLocation').value = bike.location;
    $('editBikeStatus').value   = bike.status;
    $('editBikeImg').value      = bike.img || '';
    $('editBikeBadge').value    = bike.badge || 'Available';
    $('editBikeEngine').value   = bike.engine || '';
    $('editBikeDesc').value     = bike.desc || '';
    $('editModalOverlay').classList.add('open');
  } catch (err) {
    console.error(err);
  }
};

function closeEditModal() { $('editModalOverlay').classList.remove('open'); }
$('editModalClose').addEventListener('click', closeEditModal);
$('editCancelBtn').addEventListener('click', closeEditModal);
$('editModalOverlay').addEventListener('click', e => { if (e.target === $('editModalOverlay')) closeEditModal(); });

$('editBikeForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id  = $('editBikeId').value;
  const btn = e.target.querySelector('button[type=submit]');
  btn.disabled = true;

  const payload = {
    name:     $('editBikeName').value.trim(),
    category: $('editBikeCategory').value,
    price:    +$('editBikePrice').value,
    location: $('editBikeLocation').value.trim(),
    status:   $('editBikeStatus').value,
    img:      $('editBikeImg').value.trim(),
    badge:    $('editBikeBadge').value,
    engine:   $('editBikeEngine').value.trim(),
    desc:     $('editBikeDesc').value.trim()
  };

  try {
    const res = await apiFetch(`${API}/bikes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    if (!res) return;
    if (!res.ok) { showToast('Failed to update bike', 'error'); return; }
    closeEditModal();
    renderManageBikes($('manageBikeSearch').value.trim());
    showToast('Bike updated successfully!');
  } catch {
    showToast('Failed to update bike', 'error');
  } finally {
    btn.disabled = false;
  }
});

// ── BOOKINGS ──
async function renderBookings() {
  try {
    const res      = await apiFetch(`${API}/bookings`);
    if (!res) return;
    const bookings = await res.json();

    $('bookingCount').textContent = `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`;
    const tbody = $('bookingsTbody');
    const empty = $('bookingsEmpty');

    if (!bookings.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><code style="color:var(--orange);font-size:12px">${b.bookingId}</code></td>
        <td style="font-weight:600">${b.customer || '–'}</td>
        <td>${b.phone || '–'}</td>
        <td>${b.bike || '–'}</td>
        <td>${fmtDate(b.from)}</td>
        <td>${fmtDate(b.to)}</td>
        <td>${b.pickupTime || '–'}</td>
        <td style="color:#4ade80;font-weight:600">₹${(b.amount || 0).toLocaleString('en-IN')}</td>
        <td>${statusBadge(b.status || 'pending')}</td>
        <td>
          ${b.status !== 'confirmed'  ? `<button class="btn-icon btn-edit"   onclick="updateStatus('${b._id}','confirmed')"><i class="fas fa-check"></i></button>` : ''}
          ${b.status !== 'cancelled' ? `<button class="btn-icon btn-delete" onclick="updateStatus('${b._id}','cancelled')" style="margin-left:4px"><i class="fas fa-xmark"></i></button>` : ''}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Bookings error:', err);
  }
}

window.updateStatus = async function (id, status) {
  try {
    const res = await apiFetch(`${API}/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    if (!res) return;
    if (!res.ok) { showToast('Failed to update status', 'error'); return; }
    showToast(`Booking marked as ${status}`);
    renderBookings();
  } catch {
    showToast('Failed to update status', 'error');
  }
};

// ── PAYMENTS ──
async function renderPayments() {
  try {
    const [statsRes, bookingsRes] = await Promise.all([
      apiFetch(`${API}/bookings/stats`),
      apiFetch(`${API}/bookings`)
    ]);
    if (!statsRes || !bookingsRes) return;

    const stats    = await statsRes.json();
    const bookings = await bookingsRes.json();
    const pending  = stats.total - stats.confirmed;

    $('payStats').innerHTML = `
      <div class="stat-card">
        <div class="stat-icon green"><i class="fas fa-indian-rupee-sign"></i></div>
        <div><div class="stat-val">₹${stats.revenue.toLocaleString('en-IN')}</div><div class="stat-lbl">Total Revenue</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="fas fa-circle-check"></i></div>
        <div><div class="stat-val">${stats.confirmed}</div><div class="stat-lbl">Paid Bookings</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i class="fas fa-clock"></i></div>
        <div><div class="stat-val">${pending}</div><div class="stat-lbl">Pending</div></div>
      </div>
    `;

    const tbody = $('paymentsTbody');
    const empty = $('paymentsEmpty');

    if (!bookings.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><code style="color:var(--orange);font-size:12px">${b.bookingId}</code></td>
        <td style="font-weight:600">${b.customer || '–'}</td>
        <td>${b.bike || '–'}</td>
        <td>${fmtDate(b.createdAt || b.from)}</td>
        <td style="color:#4ade80;font-weight:600">₹${(b.amount || 0).toLocaleString('en-IN')}</td>
        <td>${statusBadge(b.status || 'confirmed')}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Payments error:', err);
  }
}

// ── INIT ──
if (getToken()) renderDashboard();
