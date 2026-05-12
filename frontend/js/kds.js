const kdsSession = CinoxAPI.requireSession();
// Chỉ cho phép ADMIN và KITCHEN truy cập màn hình bếp
if (kdsSession && !CinoxAPI.isAdminUser(kdsSession.user) && !CinoxAPI.isKitchenUser(kdsSession.user)) {
  window.location.replace("./pos.html");
}

// DOM Elements
const kdsClock = document.getElementById("kdsClock");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const userAvatar = document.getElementById("userAvatar");
const backToAdminButton = document.getElementById("backToAdminButton");
const logoutButton = document.getElementById("logoutButton");
const viewStatsButton = document.getElementById("viewStatsButton");
const pendingOrdersCount = document.getElementById("pendingOrdersCount");
const preparingOrdersCount = document.getElementById("preparingOrdersCount");
const completedTodayCount = document.getElementById("completedTodayCount");
const kdsBoard = document.getElementById("kdsBoard");
const itemDetailModal = document.getElementById("itemDetailModal");
const statsModal = document.getElementById("statsModal");
const closeModalButton = document.getElementById("closeModalButton");
const closeStatsButton = document.getElementById("closeStatsButton");
const modalBody = document.getElementById("modalBody");
const statsBody = document.getElementById("statsBody");

// State
let kitchenOrders = [];
let todayStats = { completed: 0 };
let refreshInterval = null;

// Ẩn nút quay lại Admin nếu user là KITCHEN
if (CinoxAPI.isKitchenUser(kdsSession.user)) {
  backToAdminButton.style.display = "none";
}

// ========== UTILITIES ==========
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatTime = (dateString) => {
  if (!dateString) return "--:--";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(dateString));
};

const getInitials = (fullName) =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0].toUpperCase())
    .join("");

const getElapsedTime = (startTime) => {
  if (!startTime) return "0 phút";
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
  return `${elapsed} phút`;
};

// ========== CLOCK ==========
const updateClock = () => {
  kdsClock.textContent = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
};

// ========== USER INFO ==========
const updateUserInfo = () => {
  userName.textContent = kdsSession.user.full_name || "Nhân viên bếp";
  userRole.textContent = kdsSession.user.role || "KITCHEN";
  userAvatar.textContent = getInitials(userName.textContent);
};

// ========== FETCH DATA ==========
const fetchKitchenOrders = async () => {
  try {
    const result = await CinoxAPI.request("/api/kds/orders", { method: "GET" });
    kitchenOrders = result.data || [];
    renderSummary();
    renderBoard();
  } catch (error) {
    console.error("Lỗi tải đơn bếp:", error);
    // Không hiển thị alert để tránh vòng lặp vô hạn
    kitchenOrders = [];
    renderSummary();
    renderBoard();
  }
};

const fetchTodayStats = async () => {
  try {
    const result = await CinoxAPI.request("/api/kds/stats/today", { method: "GET" });
    todayStats = result.data || { completed: 0 };
    completedTodayCount.textContent = todayStats.completed || 0;
  } catch (error) {
    console.error("Lỗi tải thống kê:", error);
    completedTodayCount.textContent = 0;
  }
};

// ========== UPDATE STATUS ==========
const updateItemStatus = async (itemId, newStatus) => {
  try {
    await CinoxAPI.request(`/api/kds/items/${itemId}/status`, {
      method: "PUT",
      body: JSON.stringify({ kitchen_status: newStatus })
    });
    
    // Refresh data
    await fetchKitchenOrders();
    await fetchTodayStats();
    
    // Show notification
    showNotification(`Đã cập nhật trạng thái thành ${newStatus}`);
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
  }
};

// ========== RENDER ==========
const renderSummary = () => {
  let pendingCount = 0;
  let preparingCount = 0;

  kitchenOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.kitchen_status === "PENDING") pendingCount++;
      if (item.kitchen_status === "PREPARING") preparingCount++;
    });
  });

  pendingOrdersCount.textContent = pendingCount;
  preparingOrdersCount.textContent = preparingCount;
};

const renderBoard = () => {
  if (kitchenOrders.length === 0) {
    kdsBoard.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍳</div>
        <h3>Chưa Có Đơn Hàng</h3>
        <p>Hệ thống đang chờ đơn hàng từ quầy POS...</p>
      </div>
    `;
    return;
  }

  kdsBoard.innerHTML = kitchenOrders
    .map((order) => {
      const orderTime = formatTime(order.created_at);
      const elapsedTime = getElapsedTime(order.created_at);

      return `
        <article class="order-card">
          <div class="order-header">
            <span class="order-number">Đơn #${order.order_id.slice(0, 8)}</span>
            <span class="order-time">${orderTime} (${elapsedTime})</span>
          </div>
          
          <div class="order-meta">
            <span>👤 ${order.employee_name}</span>
            <span>💰 ${formatCurrency(order.total_amount)}</span>
          </div>

          <div class="order-items">
            ${order.items.map((item) => renderOrderItem(item)).join("")}
          </div>
        </article>
      `;
    })
    .join("");
};

const renderOrderItem = (item) => {
  const isCompleted = item.kitchen_status === "COMPLETED";
  const isPreparing = item.kitchen_status === "PREPARING";
  const isPending = item.kitchen_status === "PENDING";

  return `
    <div class="order-item">
      <div class="item-header">
        <span class="item-name">${item.product_name}</span>
        <span class="item-quantity">x${item.quantity}</span>
      </div>

      ${item.note ? `<div class="item-note">📝 Ghi chú: ${item.note}</div>` : ""}

      <div class="item-instructions">
        <div class="item-instructions-title">📋 Hướng Dẫn Chế Biến:</div>
        <div class="item-instructions-content">${item.cooking_instructions}</div>
      </div>

      <div class="item-prep-time">
        ⏱️ Thời gian dự kiến: ${item.preparation_time} phút
        ${isPreparing ? `<span style="color: var(--info)"> • Đã làm: ${getElapsedTime(item.started_at)}</span>` : ""}
      </div>

      <div class="item-actions">
        ${isPending ? `
          <button class="action-button start" onclick="handleStartItem('${item.id}')">
            ▶️ Bắt Đầu
          </button>
        ` : ""}
        
        ${isPreparing ? `
          <button class="action-button complete" onclick="handleCompleteItem('${item.id}')">
            ✅ Hoàn Thành
          </button>
        ` : ""}
        
        ${isCompleted ? `
          <span class="status-badge COMPLETED">✅ Đã Xong</span>
        ` : ""}
      </div>
    </div>
  `;
};

// ========== HANDLERS ==========
window.handleStartItem = async (itemId) => {
  if (confirm("Bắt đầu chế biến món này?")) {
    await updateItemStatus(itemId, "PREPARING");
  }
};

window.handleCompleteItem = async (itemId) => {
  if (confirm("Xác nhận món đã hoàn thành?")) {
    await updateItemStatus(itemId, "COMPLETED");
  }
};

// ========== STATS MODAL ==========
const showStatsModal = async () => {
  statsModal.classList.add("active");
  statsBody.innerHTML = '<div class="stats-loading">Đang tải thống kê...</div>';

  try {
    const result = await CinoxAPI.request("/api/kds/stats/today", { method: "GET" });
    const stats = result.data || {};

    statsBody.innerHTML = `
      <div class="kds-summary" style="margin-bottom: 1.5rem;">
        <div class="summary-card">
          <span>Tổng Món</span>
          <strong>${stats.total || 0}</strong>
        </div>
        <div class="summary-card pending">
          <span>Đang Chờ</span>
          <strong>${stats.pending || 0}</strong>
        </div>
        <div class="summary-card preparing">
          <span>Đang Làm</span>
          <strong>${stats.preparing || 0}</strong>
        </div>
        <div class="summary-card completed">
          <span>Đã Xong</span>
          <strong>${stats.completed || 0}</strong>
        </div>
      </div>

      <h3 style="margin-bottom: 1rem;">📜 Chi Tiết Món Đã Làm Hôm Nay</h3>
      <div class="stats-grid">
        ${stats.items
          ?.filter((item) => item.status === "COMPLETED")
          .map(
            (item) => `
          <div class="stats-item">
            <div class="stats-item-header">
              <span class="stats-item-name">${item.product_name} x${item.quantity}</span>
              <span class="status-badge ${item.status}">${item.status}</span>
            </div>
            <div class="stats-item-time">
              ✅ Hoàn thành lúc: ${formatTime(item.completed_at)}
            </div>
          </div>
        `
          )
          .join("") || '<p style="text-align: center; color: var(--text-muted);">Chưa có món nào hoàn thành</p>'}
      </div>
    `;
  } catch (error) {
    statsBody.innerHTML = '<div class="stats-loading">❌ Không thể tải thống kê</div>';
  }
};

// ========== NOTIFICATIONS ==========
const showNotification = (message) => {
  // Simple notification (có thể nâng cấp thành toast)
  console.log("✅", message);
  // Tạo toast notification đơn giản
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

// ========== EVENT LISTENERS ==========
backToAdminButton.addEventListener("click", () => {
  window.location.href = "./admin.html";
});

logoutButton.addEventListener("click", () => {
  if (confirm("Bạn có chắc muốn đăng xuất?")) {
    CinoxAPI.clearSession();
    window.location.replace("./index.html");
  }
});

viewStatsButton.addEventListener("click", showStatsModal);

closeModalButton.addEventListener("click", () => {
  itemDetailModal.classList.remove("active");
});

closeStatsButton.addEventListener("click", () => {
  statsModal.classList.remove("active");
});

// Close modal on outside click
[itemDetailModal, statsModal].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
});

// ========== INIT ==========
const initKDS = async () => {
  updateUserInfo();
  updateClock();
  setInterval(updateClock, 1000);

  // Hiển thị trạng thái loading
  kdsBoard.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">⏳</div>
      <h3>Đang Kết Nối...</h3>
      <p>Đang tải dữ liệu từ server...</p>
    </div>
  `;

  await fetchKitchenOrders();
  await fetchTodayStats();

  // Realtime refresh every 10 seconds (tăng từ 5s để giảm tải)
  refreshInterval = setInterval(async () => {
    await fetchKitchenOrders();
    await fetchTodayStats();
  }, 10000);
};

// Start
initKDS().catch((error) => {
  console.error("Lỗi khởi tạo KDS:", error);
  kdsBoard.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❌</div>
      <h3>Lỗi Kết Nối</h3>
      <p>Không thể kết nối đến server. Vui lòng kiểm tra:</p>
      <ul style="text-align: left; margin-top: 1rem;">
        <li>Backend server đã chạy chưa? (npm start)</li>
        <li>URL API đúng chưa? (http://localhost:3000)</li>
        <li>Token còn hạn không?</li>
      </ul>
      <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: var(--bg-accent); border: none; border-radius: 12px; color: white; cursor: pointer;">
        🔄 Thử Lại
      </button>
    </div>
  `;
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
