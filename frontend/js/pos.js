const TAX_RATE = 0.08;

const session = CinoxAPI.requireSession();
const isAdmin = CinoxAPI.isAdminUser(session?.user);
const isKitchen = CinoxAPI.isKitchenUser(session?.user);
const allowAdminPreview = new URLSearchParams(window.location.search).get("preview") === "1";

// Nếu là KITCHEN thì chuyển về màn hình bếp
if (isKitchen) {
  window.location.replace("./kds.html");
}

// Nếu là ADMIN và không có preview thì chuyển về admin
if (isAdmin && !allowAdminPreview) {
  window.location.replace("./admin.html");
}

const categoryList = document.getElementById("categoryList");
const menuGrid = document.getElementById("menuGrid");
const orderItems = document.getElementById("orderItems");
const searchInput = document.getElementById("searchInput");
const menuStatus = document.getElementById("menuStatus");
const subtotalValue = document.getElementById("subtotalValue");
const taxValue = document.getElementById("taxValue");
const totalValue = document.getElementById("totalValue");
const resetFilterButton = document.getElementById("resetFilterButton");
const staffName = document.getElementById("staffName");
const staffRole = document.getElementById("staffRole");
const staffAvatar = document.getElementById("staffAvatar");
const dashboardButton = document.getElementById("dashboardButton");
const logoutButton = document.getElementById("logoutButton");
const checkoutButton = document.getElementById("checkoutButton");
const addMenuButton = document.getElementById("addMenuButton");
const clearOrderButton = document.getElementById("clearOrderButton");

let categories = [{ id: "all", name: "Tat ca", icon: "◎" }];
let activeCategory = "all";
let searchQuery = "";
let orderState = [];
let menuState = [];
let ordersHistory = [];
let activeTab = 'menu';
let currentShift = null;
let shiftHistory = [];

const glyphByCategoryName = {
  "Đồ ăn chính": "🍗",
  "Đồ uống": "🥤",
  "Tráng miệng": "🍨",
  "Ăn vặt": "🍟",
  default: "🍽️"
};

const backgroundPalette = [
  "linear-gradient(160deg, #5a1708 0%, #ff9f3f 100%)",
  "linear-gradient(160deg, #2a1a12 0%, #6a2b18 100%)",
  "linear-gradient(160deg, #522112 0%, #d16728 100%)",
  "linear-gradient(160deg, #24160b 0%, #af6c17 100%)"
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const getInitials = (fullName) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0].toUpperCase())
    .join("");

const setMenuStatus = (message, type = "") => {
  menuStatus.textContent = message;
  menuStatus.className = "menu-status";
  if (type) {
    menuStatus.classList.add(`is-${type}`);
  }
};

const getProductVisualMeta = (product, index) => ({
  glyph: glyphByCategoryName[product.category_name] || glyphByCategoryName.default,
  background: backgroundPalette[index % backgroundPalette.length]
});

const renderProductVisual = (item, index) => {
  if (item.image_url) {
    return `
      <div class="card-visual card-visual-image">
        <img class="card-image" src="${item.image_url}" alt="${item.name}">
      </div>
    `;
  }

  const visual = getProductVisualMeta(item, index);
  return `
    <div class="card-visual" style="background:${visual.background}">
      <span class="card-glyph">${visual.glyph}</span>
    </div>
  `;
};

const updateStaffHeader = () => {
  staffName.textContent = session.user.full_name || session.user.employee_code || "Nhan vien";
  staffRole.textContent = isAdmin ? "ADMIN / Quan ly" : (session.user.role || "Thu ngan");
  staffAvatar.textContent = getInitials(staffName.textContent || "NV");
  dashboardButton.hidden = !isAdmin;
  addMenuButton.hidden = true;
};

const renderCategories = () => {
  categoryList.innerHTML = categories
    .map(
      (category) => `
        <button class="category-button ${category.id === activeCategory ? "is-active" : ""}" type="button" data-category="${category.id}">
          <span class="category-icon">${category.icon || "◎"}</span>
          <span class="category-label">${category.name}</span>
        </button>
      `
    )
    .join("");
};

const getVisibleMenu = () =>
  menuState.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category_id === activeCategory;
    const query = searchQuery.toLowerCase();
    const haystack = `${item.name} ${item.category_name}`.toLowerCase();
    const matchSearch = !query || haystack.includes(query);
    return matchCategory && matchSearch;
  });

const renderMenu = () => {
  const visibleMenu = getVisibleMenu();

  if (visibleMenu.length === 0) {
    menuGrid.innerHTML = `
      <div class="empty-order">
        <strong>Chua co mon dang ban</strong>
        <p>Database products hien chua co du lieu khop voi bo loc hien tai.</p>
      </div>
    `;
    return;
  }

  menuGrid.innerHTML = visibleMenu
    .map(
      (item, index) => `
        <article class="menu-card" data-menu-id="${item.id}">
          ${renderProductVisual(item, index)}
          <div class="menu-card-body">
            <h3>${item.name}</h3>
            <p class="item-meta">${item.category_name}<br><span>${formatCurrency(item.price)}</span></p>
            <div class="menu-card-footer">
              <strong class="item-price">${formatCurrency(item.price)}</strong>
              <button class="add-button" type="button" data-add-item="${item.id}">Them</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
};

const renderOrder = () => {
  if (orderState.length === 0) {
    orderItems.innerHTML = `
      <div class="empty-order">
        <strong>Chua co mon trong don</strong>
        <p>Chon mon tu thuc don ben trai de bat dau giao dich.</p>
      </div>
    `;
  } else {
    orderItems.innerHTML = orderState
      .map((item, index) => {
        const visual = getProductVisualMeta(item, index);
        return `
          <article class="order-item">
            <div class="order-thumb" style="background:${visual.background}">${visual.glyph}</div>
            <div class="order-copy">
              <strong>${item.name}</strong>
              <span>${item.category_name}</span>
            </div>
            <div class="order-side">
              <strong>${formatCurrency(item.price * item.quantity)}</strong>
              <div class="qty-controls">
                <button class="qty-button" type="button" data-qty-action="decrease" data-id="${item.id}">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-button" type="button" data-qty-action="increase" data-id="${item.id}">+</button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  const subtotal = orderState.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  subtotalValue.textContent = formatCurrency(subtotal);
  taxValue.textContent = formatCurrency(tax);
  totalValue.textContent = formatCurrency(total);
  
  // Update change amount when order changes
  updateChangeAmount();
};

// Update change amount based on customer paid input
const updateChangeAmount = () => {
  const input = document.getElementById('customerPaidInput');
  const changeDisplay = document.getElementById('changeAmount');
  const changeContainer = document.querySelector('.payment-change-display');
  
  if (!input || !changeDisplay) return;
  
  // Calculate total
  const subtotal = orderState.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  
  // Get customer paid amount
  const inputValue = input.value.replace(/\D/g, '');
  const paidAmount = Number(inputValue) || 0;
  
  // Calculate change
  const change = paidAmount - total;
  
  // Update display
  if (paidAmount === 0) {
    changeDisplay.textContent = '0đ';
    changeContainer?.classList.remove('insufficient');
  } else if (change >= 0) {
    changeDisplay.textContent = formatCurrency(change);
    changeContainer?.classList.remove('insufficient');
  } else {
    changeDisplay.textContent = formatCurrency(Math.abs(change)) + ' (thiếu)';
    changeContainer?.classList.add('insufficient');
  }
};

const fetchCategories = async () => {
  const result = await CinoxAPI.request("/api/categories", { method: "GET" });
  categories = [
    { id: "all", name: "Tat ca", icon: "◎" },
    ...(result.data || []).map((category, index) => ({
      id: category.id,
      name: category.name,
      icon: ["🍗", "🥤", "🍨", "🍟"][index % 4] || "◎"
    }))
  ];
  renderCategories();
};

const fetchProducts = async () => {
  setMenuStatus("Dang tai thuc don tu database...", "loading");

  try {
    const result = await CinoxAPI.request("/api/products", { method: "GET" });
    menuState = result.data || [];
    setMenuStatus(menuState.length ? `Da tai ${menuState.length} mon dang ban.` : "Database chua co mon dang ban.");
  } catch (error) {
    menuState = [];
    setMenuStatus(error.message || "Khong ket noi duoc API products.", "error");
  }

  renderMenu();
};

const addItemToOrder = (id) => {
  const selectedItem = menuState.find((item) => item.id === id);
  if (!selectedItem) return;

  const existingItem = orderState.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    orderState.push({ ...selectedItem, quantity: 1 });
  }

  renderOrder();
};

const updateQuantity = (id, delta) => {
  const target = orderState.find((item) => item.id === id);
  if (!target) return;
  target.quantity += delta;
  if (target.quantity <= 0) {
    orderState = orderState.filter((item) => item.id !== id);
  }
  renderOrder();
};

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCategories();
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-item]");
  if (!button) return;
  addItemToOrder(button.dataset.addItem);
});

orderItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-qty-action]");
  if (!button) return;
  updateQuantity(button.dataset.id, button.dataset.qtyAction === "increase" ? 1 : -1);
});

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value.trim();
  renderMenu();
});

resetFilterButton.addEventListener("click", () => {
  activeCategory = "all";
  searchQuery = "";
  searchInput.value = "";
  renderCategories();
  renderMenu();
});

logoutButton.addEventListener("click", () => {
  CinoxAPI.clearSession();
  window.location.replace("./index.html");
});

dashboardButton.addEventListener("click", () => {
  window.location.href = "./admin.html";
});

checkoutButton.addEventListener("click", async () => {
  if (orderState.length === 0) {
    alert("Đơn hàng đang trống. Hãy thêm món trước khi thanh toán.");
    return;
  }

  // Tính toán
  const subtotal = orderState.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  // Lấy số tiền khách đưa
  const input = document.getElementById('customerPaidInput');
  const inputValue = input.value.replace(/\D/g, '');
  const paidAmount = Number(inputValue) || 0;

  // Validate
  if (paidAmount < total) {
    alert(
      `❌ Số tiền không đủ!\n\n` +
      `Tổng cần thanh toán: ${formatCurrency(total)}\n` +
      `Khách đưa: ${formatCurrency(paidAmount)}\n\n` +
      `Vui lòng nhập số tiền >= ${formatCurrency(total)}`
    );
    input.focus();
    return;
  }

  const change = paidAmount - total;

  // Confirm
  const confirmed = confirm(
    `✅ XÁC NHẬN THANH TOÁN\n\n` +
    `Tổng cộng: ${formatCurrency(total)}\n` +
    `Khách đưa: ${formatCurrency(paidAmount)}\n` +
    `Tiền thối: ${formatCurrency(change)}\n\n` +
    `Xác nhận thanh toán?`
  );

  if (!confirmed) return;

  // Disable button
  checkoutButton.disabled = true;
  checkoutButton.textContent = "Đang xử lý...";

  try {
    // Create order
    const result = await CinoxAPI.request("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: orderState.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          note: ""
        })),
        payment_method: "CASH",
        customer_name: "Khách lẻ",
        customer_paid: paidAmount,
        change_amount: change
      })
    });

    // Success
    alert(
      `✅ THANH TOÁN THÀNH CÔNG!\n\n` +
      `Mã đơn: ${result.data.order_code || result.data.order_id.slice(0, 8)}\n` +
      `Tổng tiền: ${formatCurrency(total)}\n` +
      `Khách đưa: ${formatCurrency(paidAmount)}\n` +
      `Tiền thối: ${formatCurrency(change)}\n\n` +
      `Đơn hàng đã được gửi đến bếp!`
    );

    // Reset order
    orderState = [];
    input.value = '';
    renderOrder();

  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    alert(`❌ Thanh toán thất bại!\n\n${error.message || "Vui lòng thử lại"}`);
  } finally {
    // Re-enable button
    checkoutButton.disabled = false;
    checkoutButton.textContent = "Thanh toán";
  }
});

// Hủy đơn hàng hiện tại
clearOrderButton.addEventListener("click", async () => {
  if (orderState.length === 0) {
    alert("Không có đơn hàng để hủy.");
    return;
  }

  const subtotal = orderState.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const reason = prompt(
    `⚠️ Xác nhận hủy đơn hàng?\n\n` +
    `Tổng món: ${orderState.length}\n` +
    `Tổng tiền: ${formatCurrency(total)}\n\n` +
    `Vui lòng nhập lý do hủy đơn:`
  );

  if (!reason) return; // User clicked Cancel

  // Disable button
  clearOrderButton.disabled = true;
  clearOrderButton.textContent = "Đang xử lý...";

  try {
    // Tạo đơn hàng với status CANCELLED
    const result = await CinoxAPI.request("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        items: orderState.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          note: ""
        })),
        payment_method: "CANCELLED",
        customer_name: "Khách lẻ",
        status: "CANCELLED",
        cancellation_reason: reason
      })
    });

    // Thành công
    alert(
      `✅ Đã hủy đơn hàng!\n\n` +
      `Lý do: ${reason}\n` +
      `Tổng tiền: ${formatCurrency(total)}\n\n` +
      `Đơn đã được lưu vào hệ thống.`
    );

    // Reset đơn hàng
    orderState = [];
    renderOrder();

  } catch (error) {
    console.error("Lỗi hủy đơn:", error);
    alert(`❌ Không thể hủy đơn!\n\n${error.message || "Vui lòng thử lại"}`);
  } finally {
    // Enable lại button
    clearOrderButton.disabled = false;
    clearOrderButton.textContent = "Hủy Đơn";
  }
});
// Hủy Đơn Hàng
const cancelOrder = () => {
  if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
    orderState = [];
    renderOrder();
    alert("Đã hủy đơn hàng");
  }
};

// ============================================
// TAB SWITCHING
// ============================================
const switchTab = (tabName) => {
  activeTab = tabName;
  
  // Update nav pills
  document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.classList.toggle('is-active', pill.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('is-active');
  });
  
  if (tabName === 'menu') {
    document.getElementById('menuTab').classList.add('is-active');
  } else if (tabName === 'orders') {
    document.getElementById('ordersTab').classList.add('is-active');
    fetchOrdersHistory();
  } else if (tabName === 'report') {
    document.getElementById('reportTab').classList.add('is-active');
    fetchCurrentShift();
    fetchShiftHistory();
  }
};

// ============================================
// ORDERS HISTORY
// ============================================
const setOrdersStatus = (message, type = '') => {
  const ordersStatus = document.getElementById('ordersStatus');
  ordersStatus.textContent = message;
  ordersStatus.className = 'menu-status';
  if (type) {
    ordersStatus.classList.add(`is-${type}`);
  }
};

const fetchOrdersHistory = async () => {
  setOrdersStatus('Đang tải lịch sử đơn hàng...', 'loading');
  
  try {
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const query = statusFilter ? `?status=${statusFilter}` : '';
    
    const result = await CinoxAPI.request(`/api/orders${query}`, { method: 'GET' });
    ordersHistory = result.data || [];
    
    setOrdersStatus(
      ordersHistory.length 
        ? `Tìm thấy ${ordersHistory.length} đơn hàng` 
        : 'Chưa có đơn hàng nào'
    );
    
    renderOrdersHistory();
  } catch (error) {
    ordersHistory = [];
    setOrdersStatus(error.message || 'Không thể tải lịch sử đơn hàng', 'error');
    renderOrdersHistory();
  }
};

const renderOrdersHistory = () => {
  const tbody = document.getElementById('ordersTableBody');
  
  if (ordersHistory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="orders-empty">
          <strong>Chưa có đơn hàng nào</strong>
          <p>Các đơn hàng bạn tạo sẽ xuất hiện ở đây</p>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = ordersHistory.map(order => {
    const orderTime = new Date(order.created_at).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const itemsCount = order.order_items?.length || 0;
    const statusClass = order.status.toLowerCase();
    const statusText = {
      'COMPLETED': 'Hoàn thành',
      'PENDING': 'Đang xử lý',
      'CANCELLED': 'Đã hủy'
    }[order.status] || order.status;
    
    const canCancel = order.status !== 'CANCELLED';
    
    return `
      <tr>
        <td><span class="order-code">${order.id.slice(0, 8).toUpperCase()}</span></td>
        <td><span class="order-time">${orderTime}</span></td>
        <td>${itemsCount} món</td>
        <td><strong>${formatCurrency(order.total_amount)}</strong></td>
        <td><span class="order-status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="order-actions">
            <button class="order-action-btn view" data-view-order="${order.id}">
              👁️ Xem
            </button>
            <button class="order-action-btn cancel" data-cancel-order="${order.id}" ${!canCancel ? 'disabled' : ''}>
              ❌ Hủy
            </button>
            <button class="order-action-btn print" data-print-order="${order.id}">
              🖨️ In lại
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
};

const viewOrderDetail = async (orderId) => {
  try {
    const result = await CinoxAPI.request(`/api/orders/${orderId}`, { method: 'GET' });
    const order = result.data;
    
    const orderTime = new Date(order.created_at).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const itemsList = order.order_items.map(item => `
      ${item.product_name_snapshot} x${item.quantity} - ${formatCurrency(item.unit_price * item.quantity)}
    `).join('\n');
    
    const statusText = {
      'COMPLETED': 'Hoàn thành',
      'PENDING': 'Đang xử lý',
      'CANCELLED': 'Đã hủy'
    }[order.status] || order.status;
    
    let message = `📋 CHI TIẾT ĐƠN HÀNG\n\n`;
    message += `Mã đơn: ${order.id.slice(0, 8).toUpperCase()}\n`;
    message += `Thời gian: ${orderTime}\n`;
    message += `Trạng thái: ${statusText}\n`;
    message += `Nhân viên: ${order.employee_code}\n\n`;
    message += `📦 DANH SÁCH MÓN:\n${itemsList}\n\n`;
    message += `💰 TỔNG TIỀN: ${formatCurrency(order.total_amount)}`;
    
    if (order.cancellation_reason) {
      message += `\n\n❌ Lý do hủy: ${order.cancellation_reason}`;
    }
    
    alert(message);
  } catch (error) {
    alert(`❌ Không thể tải chi tiết đơn hàng\n\n${error.message}`);
  }
};

const cancelOrderFromHistory = async (orderId) => {
  const order = ordersHistory.find(o => o.id === orderId);
  if (!order) return;
  
  const reason = prompt(
    `⚠️ Xác nhận hủy đơn hàng?\n\n` +
    `Mã đơn: ${order.id.slice(0, 8).toUpperCase()}\n` +
    `Tổng tiền: ${formatCurrency(order.total_amount)}\n\n` +
    `Vui lòng nhập lý do hủy đơn:`
  );
  
  if (!reason) return;
  
  try {
    await CinoxAPI.request(`/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellation_reason: reason })
    });
    
    alert(`✅ Đã hủy đơn hàng!\n\nLý do: ${reason}`);
    fetchOrdersHistory(); // Reload
  } catch (error) {
    alert(`❌ Không thể hủy đơn hàng\n\n${error.message}`);
  }
};

const printOrderReceipt = (orderId) => {
  const order = ordersHistory.find(o => o.id === orderId);
  if (!order) return;
  
  const orderTime = new Date(order.created_at).toLocaleString('vi-VN');
  const itemsList = order.order_items.map(item => 
    `${item.product_name_snapshot} x${item.quantity} - ${formatCurrency(item.unit_price * item.quantity)}`
  ).join('\n');
  
  const receipt = `
========================================
         CINOX CINEMA POS
========================================
Mã đơn: ${order.id.slice(0, 8).toUpperCase()}
Thời gian: ${orderTime}
Nhân viên: ${order.employee_code}
========================================

${itemsList}

========================================
TỔNG TIỀN: ${formatCurrency(order.total_amount)}
========================================

Cảm ơn quý khách!
  `.trim();
  
  console.log(receipt);
  alert(`🖨️ In hóa đơn\n\n${receipt}\n\n(Hóa đơn đã được gửi đến máy in)`);
};

// Event listeners for orders tab
document.addEventListener('click', (event) => {
  // Tab switching
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    switchTab(tabButton.dataset.tab);
    return;
  }
  
  // View order
  const viewButton = event.target.closest('[data-view-order]');
  if (viewButton) {
    viewOrderDetail(viewButton.dataset.viewOrder);
    return;
  }
  
  // Cancel order
  const cancelButton = event.target.closest('[data-cancel-order]');
  if (cancelButton && !cancelButton.disabled) {
    cancelOrderFromHistory(cancelButton.dataset.cancelOrder);
    return;
  }
  
  // Print order
  const printButton = event.target.closest('[data-print-order]');
  if (printButton) {
    printOrderReceipt(printButton.dataset.printOrder);
    return;
  }
});

// Refresh orders button
document.getElementById('refreshOrdersButton')?.addEventListener('click', fetchOrdersHistory);

// Status filter
document.getElementById('orderStatusFilter')?.addEventListener('change', fetchOrdersHistory);

// ============================================
// SHIFT REPORT TAB
// ============================================
const setShiftStatus = (message, type = '') => {
  const shiftStatus = document.getElementById('shiftStatus');
  shiftStatus.textContent = message;
  shiftStatus.className = 'menu-status';
  if (type) {
    shiftStatus.classList.add(`is-${type}`);
  }
};

const fetchCurrentShift = async () => {
  try {
    const result = await CinoxAPI.request('/api/shifts/current', { method: 'GET' });
    currentShift = result.data;
    renderShiftStatus();
  } catch (error) {
    console.error('Error fetching shift:', error);
    currentShift = null;
    renderShiftStatus();
  }
};

const fetchShiftHistory = async () => {
  try {
    const result = await CinoxAPI.request('/api/shifts/history?limit=10', { method: 'GET' });
    shiftHistory = result.data || [];
    renderShiftHistory();
  } catch (error) {
    console.error('Error fetching shift history:', error);
    shiftHistory = [];
    renderShiftHistory();
  }
};

const renderShiftStatus = () => {
  const badge = document.getElementById('shiftBadge');
  const body = document.getElementById('shiftCardBody');
  const actions = document.getElementById('shiftCardActions');

  if (!currentShift) {
    // Chưa mở ca
    badge.textContent = 'Chưa mở ca';
    badge.className = 'shift-badge closed';
    
    body.innerHTML = `
      <div class="shift-empty">
        <strong>Chưa mở ca làm việc</strong>
        <p>Vui lòng mở ca để bắt đầu làm việc</p>
      </div>
    `;
    
    actions.innerHTML = `
      <button class="shift-action-btn open" id="openShiftBtn" type="button">
        🔓 Mở ca
      </button>
    `;
    
    return;
  }

  // Đã mở ca - CHỈ HIỂN thị trạng thái, KHÔNG hiển thị doanh thu
  badge.textContent = 'Ca đang mở';
  badge.className = 'shift-badge open';

  const openedTime = new Date(currentShift.opened_at).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });

  body.innerHTML = `
    <div class="shift-info-grid">
      <div class="shift-info-item">
        <span class="shift-info-label">Giờ mở ca</span>
        <span class="shift-info-value">${openedTime}</span>
      </div>
      <div class="shift-info-item">
        <span class="shift-info-label">Tiền đầu ca</span>
        <span class="shift-info-value">${formatCurrency(currentShift.opening_cash)}</span>
      </div>
      <div class="shift-info-item">
        <span class="shift-info-label">Trạng thái</span>
        <span class="shift-info-value" style="color: #059669; font-weight: 700;">Đang hoạt động</span>
      </div>
    </div>
    <div class="shift-notice">
      <p>⏰ Ca làm việc đang mở. Vui lòng đóng ca khi kết thúc.</p>
    </div>
  `;

  actions.innerHTML = `
    <button class="shift-action-btn close" id="closeShiftBtn" type="button">
      🔒 Đóng ca
    </button>
  `;
};

const renderShiftHistory = () => {
  const tbody = document.getElementById('shiftHistoryBody');
  const historySection = document.querySelector('.shift-history-section');
  
  // Ẩn lịch sử ca cho nhân viên thường
  if (!isAdmin) {
    if (historySection) {
      historySection.style.display = 'none';
    }
    return;
  }

  // Chỉ Admin mới thấy lịch sử
  if (historySection) {
    historySection.style.display = 'block';
  }

  if (shiftHistory.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 2rem;">
          <strong>Chưa có lịch sử ca làm việc</strong>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = shiftHistory.map(shift => {
    const shiftDate = new Date(shift.shift_date).toLocaleDateString('vi-VN');
    const openedTime = new Date(shift.opened_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const closedTime = shift.closed_at 
      ? new Date(shift.closed_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      : '-';

    const difference = shift.cash_difference || 0;
    let differenceClass = 'zero';
    let differenceText = formatCurrency(Math.abs(difference));
    
    if (difference > 0) {
      differenceClass = 'positive';
      differenceText = '+' + differenceText;
    } else if (difference < 0) {
      differenceClass = 'negative';
      differenceText = '-' + differenceText;
    }

    const statusClass = shift.status === 'OPEN' ? 'pending' : 'completed';
    const statusText = shift.status === 'OPEN' ? 'Đang mở' : 'Đã đóng';

    return `
      <tr>
        <td>${shiftDate}</td>
        <td>${openedTime}</td>
        <td>${closedTime}</td>
        <td>${formatCurrency(shift.opening_cash)}</td>
        <td><strong>${formatCurrency(shift.total_revenue || 0)}</strong></td>
        <td>${shift.closing_cash ? formatCurrency(shift.closing_cash) : '-'}</td>
        <td><span class="shift-difference ${differenceClass}">${differenceText}</span></td>
        <td><span class="order-status-badge ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');
};

const openShift = async () => {
  const openingCash = prompt(
    'MỞ CA LÀM VIỆC\n\n' +
    'Nhập số tiền lẻ có sẵn trong két sắt:\n' +
    '(Ví dụ: 500000 cho 500,000đ)\n\n' +
    'Nhập 0 nếu két trống:'
  );

  if (openingCash === null) return; // User cancelled

  const amount = Number(openingCash.trim());
  if (isNaN(amount) || amount < 0) {
    alert('❌ Số tiền không hợp lệ!\n\nVui lòng nhập số dương (ví dụ: 500000)');
    return;
  }

  try {
    await CinoxAPI.request('/api/shifts/open', {
      method: 'POST',
      body: JSON.stringify({ opening_cash: amount })
    });

    alert(
      `✅ Đã mở ca thành công!\n\n` +
      `Tiền đầu ca: ${formatCurrency(amount)}\n` +
      `Thời gian: ${new Date().toLocaleString('vi-VN')}\n\n` +
      `Bạn có thể bắt đầu bán hàng!`
    );

    await fetchCurrentShift();
    await fetchShiftHistory();
  } catch (error) {
    alert(`❌ Không thể mở ca!\n\n${error.message}`);
  }
};

const closeShift = async () => {
  if (!currentShift) {
    alert('❌ Không có ca nào đang mở!');
    return;
  }

  const closingCash = prompt(
    '🔒 ĐÓNG CA LÀM VIỆC\n\n' +
    `Tiền đầu ca: ${formatCurrency(currentShift.opening_cash)}\n\n` +
    '📝 Đếm tổng số tiền mặt THỰC TẾ trong két sắt:\n' +
    '(Bao gồm cả tiền đầu ca + tiền bán hàng)\n\n' +
    'Nhập số tiền:'
  );

  if (closingCash === null) return; // User cancelled

  const amount = Number(closingCash.trim());
  if (isNaN(amount) || amount < 0) {
    alert('❌ Số tiền không hợp lệ!\n\nVui lòng nhập số dương.');
    return;
  }

  try {
    const result = await CinoxAPI.request('/api/shifts/close', {
      method: 'POST',
      body: JSON.stringify({ closing_cash: amount })
    });

    const shift = result.data;

    // Thông báo đơn giản cho nhân viên
    alert(
      `✅ ĐÓNG CA THÀNH CÔNG!\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `Nhân viên: ${session.user.employee_code}\n` +
      `Giờ đóng ca: ${new Date(shift.closed_at).toLocaleString('vi-VN')}\n\n` +
      `Tiền đầu ca: ${formatCurrency(shift.opening_cash)}\n` +
      `Tiền thực tế: ${formatCurrency(shift.closing_cash)}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📊 Báo cáo chốt ca đã được gửi tới Quản lý.\n` +
      `Hệ thống sẽ tự động đăng xuất...\n` +
      `━━━━━━━━━━━━━━━━━━━━━━`
    );

    // Tự động đăng xuất ngay sau khi bấm OK
    CinoxAPI.clearSession();
    window.location.replace('./index.html');
    
  } catch (error) {
    alert(`❌ Không thể đóng ca!\n\n${error.message}`);
  }
};

// Event delegation for shift buttons
document.addEventListener('click', (event) => {
  // Tab switching
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    switchTab(tabButton.dataset.tab);
    return;
  }

  // Open shift
  const openShiftBtn = event.target.closest('#openShiftBtn');
  if (openShiftBtn) {
    openShift();
    return;
  }

  // Close shift
  const closeShiftBtn = event.target.closest('#closeShiftBtn');
  if (closeShiftBtn) {
    closeShift();
    return;
  }

  // View order
  const viewButton = event.target.closest('[data-view-order]');
  if (viewButton) {
    viewOrderDetail(viewButton.dataset.viewOrder);
    return;
  }

  // Cancel order
  const cancelButton = event.target.closest('[data-cancel-order]');
  if (cancelButton && !cancelButton.disabled) {
    cancelOrderFromHistory(cancelButton.dataset.cancelOrder);
    return;
  }

  // Print order
  const printButton = event.target.closest('[data-print-order]');
  if (printButton) {
    printOrderReceipt(printButton.dataset.printOrder);
    return;
  }
});

// Refresh shift button
document.getElementById('refreshShiftButton')?.addEventListener('click', async () => {
  await fetchCurrentShift();
  await fetchShiftHistory();
});

const initPos = async () => {
  updateStaffHeader();
  renderOrder();
  await fetchCategories();
  await fetchProducts();
};

initPos().catch((error) => {
  setMenuStatus(error.message || "Khong the khoi tao man hinh POS.", "error");
});

// ============================================
// PAYMENT INPUT - Auto calculate change
// ============================================
document.getElementById('customerPaidInput')?.addEventListener('input', updateChangeAmount);

// Allow Enter key to trigger checkout
document.getElementById('customerPaidInput')?.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    checkoutButton.click();
  }
});
