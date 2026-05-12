const sectionButtons = document.querySelectorAll("[data-section-target]");
const sections = {
  dashboard: document.getElementById("dashboardSection"),
  users: document.getElementById("usersSection"),
  reports: document.getElementById("reportsSection"),
  menu: document.getElementById("menuSection")
};

// Report tabs
const reportTabButtons = document.querySelectorAll("[data-report-tab]");
const shiftsTabContent = document.getElementById("shiftsTabContent");
const detailsTabContent = document.getElementById("detailsTabContent");

// Shift detail modal
const shiftDetailModal = document.getElementById("shiftDetailModal");
const closeShiftDetailModal = document.getElementById("closeShiftDetailModal");
const shiftDetailSubtitle = document.getElementById("shiftDetailSubtitle");
const modalTotalOrders = document.getElementById("modalTotalOrders");
const modalTotalRevenue = document.getElementById("modalTotalRevenue");
const modalDifference = document.getElementById("modalDifference");
const shiftDetailTableBody = document.getElementById("shiftDetailTableBody");

const session = CinoxAPI.requireSession();
if (!session || !CinoxAPI.isAdminUser(session.user)) {
  window.location.replace("./pos.html");
}

const adminName = document.getElementById("adminName");
const adminRole = document.getElementById("adminRole");
const adminAvatar = document.getElementById("adminAvatar");
const todayChip = document.getElementById("todayChip");
const logoutButton = document.getElementById("logoutButton");
const openPosButton = document.getElementById("openPosButton");
const openKdsButton = document.getElementById("openKdsButton");

const dailyRevenueValue = document.getElementById("dailyRevenueValue");
const completedOrdersValue = document.getElementById("completedOrdersValue");
const shiftChart = document.getElementById("shiftChart");
const statusDonut = document.getElementById("statusDonut");

const createUserForm = document.getElementById("createUserForm");
const newUserName = document.getElementById("newUserName");
const newUserRole = document.getElementById("newUserRole");
const userFormFeedback = document.getElementById("userFormFeedback");
const usersTableBody = document.getElementById("usersTableBody");

const reportDateFilter = document.getElementById("reportDateFilter");
const reportEmployeeFilter = document.getElementById("reportEmployeeFilter");
const resetReportFilters = document.getElementById("resetReportFilters");
const filteredRevenueValue = document.getElementById("filteredRevenueValue");
const filteredOrdersValue = document.getElementById("filteredOrdersValue");
const filteredEmployeeValue = document.getElementById("filteredEmployeeValue");
const reportsTableBody = document.getElementById("reportsTableBody");

// Shift Reports
const shiftDateFilter = document.getElementById("shiftDateFilter");
const shiftEmployeeFilter = document.getElementById("shiftEmployeeFilter");
const shiftStatusFilter = document.getElementById("shiftStatusFilter");
const resetShiftFilters = document.getElementById("resetShiftFilters");
const totalShiftsValue = document.getElementById("totalShiftsValue");
const totalShiftRevenueValue = document.getElementById("totalShiftRevenueValue");
const totalDifferenceValue = document.getElementById("totalDifferenceValue");
const shiftsTableBody = document.getElementById("shiftsTableBody");

const menuAdminForm = document.getElementById("menuAdminForm");
const menuEditId = document.getElementById("menuEditId");
const menuAdminName = document.getElementById("menuAdminName");
const menuAdminCategory = document.getElementById("menuAdminCategory");
const menuAdminImageUrl = document.getElementById("menuAdminImageUrl");
const menuAdminPrice = document.getElementById("menuAdminPrice");
const clearMenuForm = document.getElementById("clearMenuForm");
const menuFormFeedback = document.getElementById("menuFormFeedback");
const menuTableBody = document.getElementById("menuTableBody");

let employeeState = [];
let reportState = [];
let shiftState = [];
let menuState = [];
let categoryState = [];

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

const setFeedback = (element, message, type = "") => {
  element.textContent = message;
  element.className = "inline-feedback";
  if (type) {
    element.classList.add(`is-${type}`);
  }
};

const renderAdminHeader = () => {
  adminName.textContent = session.user.full_name || "Quan tri vien";
  adminRole.textContent = session.user.role || "ADMIN";
  adminAvatar.textContent = getInitials(adminName.textContent || "AD");
  todayChip.textContent = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date());
};

const renderShiftChart = () => {
  const shiftMap = new Map([
    ["Sang", 0],
    ["Chieu", 0],
    ["Toi", 0]
  ]);

  reportState
    .filter((item) => item.status === "completed")
    .forEach((item) => {
      const hour = new Date(item.created_at).getHours();
      const shift = hour < 12 ? "Sang" : hour < 18 ? "Chieu" : "Toi";
      shiftMap.set(shift, shiftMap.get(shift) + Number(item.total_amount || 0));
    });

  const shiftTotals = Array.from(shiftMap.entries()).map(([label, total]) => ({ label, total }));
  const maxShiftRevenue = Math.max(...shiftTotals.map((item) => item.total), 1);

  shiftChart.innerHTML = shiftTotals
    .map(
      (item) => `
        <div class="bar-col">
          <div class="bar-track">
            <div class="bar-fill" style="height:${Math.max((item.total / maxShiftRevenue) * 100, 10)}%"></div>
          </div>
          <strong class="bar-value">${formatCurrency(item.total)}</strong>
          <span class="bar-label">${item.label}</span>
        </div>
      `
    )
    .join("");
};

const renderDashboard = async () => {
  try {
    const summary = await CinoxAPI.request("/api/reports/summary", { method: "GET" });
    dailyRevenueValue.textContent = formatCurrency(summary.data.revenue);
    completedOrdersValue.textContent = String(summary.data.completed_orders);

    // Show 100% completed (no cancelled orders display)
    statusDonut.style.background = `conic-gradient(var(--success) 0 100%)`;
    statusDonut.dataset.label = "100%";
  } catch (error) {
    dailyRevenueValue.textContent = formatCurrency(0);
    completedOrdersValue.textContent = "0";
    statusDonut.style.background = "conic-gradient(var(--success) 0 100%)";
    statusDonut.dataset.label = "100%";
  }
};

const renderUsers = () => {
  const roleLabels = {
    'ADMIN': 'Admin',
    'CASHIER': 'Cashier (Thu ngân)',
    'KITCHEN': 'Kitchen (Bếp)'
  };

  usersTableBody.innerHTML = employeeState
    .filter((employee) => employee.employee_code !== "ADMIN01")
    .map(
      (employee) => `
        <tr>
          <td>${employee.employee_code}</td>
          <td>${employee.full_name}</td>
          <td>${roleLabels[employee.role] || employee.role}</td>
          <td>${employee.is_active ? "Đang hoạt động" : "Đã khóa"}</td>
          <td>
            <div class="table-actions">
              <button class="table-action" type="button" data-reset-user="${employee.employee_code}">Reset mật khẩu</button>
              <button class="table-action danger" type="button" data-delete-user="${employee.employee_code}">Xóa</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  reportEmployeeFilter.innerHTML = `
    <option value="">Tất cả nhân viên</option>
    ${employeeState
      .filter((employee) => employee.employee_code !== "ADMIN01")
      .map((employee) => `<option value="${employee.employee_code}">${employee.employee_code} - ${employee.full_name}</option>`)
      .join("")}
  `;

  // Populate shift employee filter
  shiftEmployeeFilter.innerHTML = `
    <option value="">Tất cả nhân viên</option>
    ${employeeState
      .filter((employee) => employee.employee_code !== "ADMIN01")
      .map((employee) => `<option value="${employee.employee_code}">${employee.employee_code} - ${employee.full_name}</option>`)
      .join("")}
  `;
};

const fetchEmployees = async () => {
  const result = await CinoxAPI.request("/api/employees", { method: "GET" });
  employeeState = result.data || [];
  renderUsers();
};

const renderReports = () => {
  if (!reportState || !reportState.orders) {
    reportsTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Không có dữ liệu</td></tr>';
    return;
  }

  const { orders, summary } = reportState;
  
  // Update summary cards
  filteredRevenueValue.textContent = formatCurrency(summary.total_revenue || 0);
  filteredOrdersValue.textContent = String(summary.completed_orders || 0);
  document.getElementById('filteredCancelledValue').textContent = String(summary.cancelled_orders || 0);

  // Render table with items
  const rows = [];
  orders.forEach(order => {
    const orderDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const statusText = {
      'COMPLETED': 'Hoàn thành',
      'PENDING': 'Đang xử lý',
      'CANCELLED': 'Đã hủy'
    }[order.status] || order.status;
    
    const statusClass = order.status.toLowerCase();

    // Mỗi món ăn là một dòng
    if (order.items && order.items.length > 0) {
      order.items.forEach((item, index) => {
        rows.push(`
          <tr>
            <td>${index === 0 ? orderDate : ''}</td>
            <td>${index === 0 ? order.employee_code : ''}</td>
            <td>${index === 0 ? order.employee_name : ''}</td>
            <td>${item.product_name}</td>
            <td>${item.quantity}</td>
            <td>${index === 0 ? `<span class="status-badge ${statusClass}">${statusText}</span>` : ''}</td>
            <td>${index === 0 ? formatCurrency(order.total_amount) : ''}</td>
          </tr>
        `);
      });
    } else {
      // Nếu không có items, hiển thị dòng trống
      rows.push(`
        <tr>
          <td>${orderDate}</td>
          <td>${order.employee_code}</td>
          <td>${order.employee_name}</td>
          <td colspan="2" style="text-align: center; color: #9ca3af; font-style: italic;">Không có món</td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>${formatCurrency(order.total_amount)}</td>
        </tr>
      `);
    }
  });

  reportsTableBody.innerHTML = rows.join('');

  // Show footer with total
  const footer = document.getElementById('reportsTableFooter');
  const totalFooter = document.getElementById('totalRevenueFooter');
  if (footer && totalFooter) {
    footer.style.display = orders.length > 0 ? 'table-footer-group' : 'none';
    totalFooter.textContent = formatCurrency(summary.total_revenue || 0);
  }

  renderShiftChart();
};

const fetchReports = async () => {
  const query = new URLSearchParams();
  const period = document.getElementById('reportPeriodFilter')?.value || 'day';
  
  query.set('period', period);
  
  if (period === 'day' && reportDateFilter.value) {
    query.set('date', reportDateFilter.value);
  }
  
  if (reportEmployeeFilter.value) {
    query.set('employee_code', reportEmployeeFilter.value);
  }
  
  const result = await CinoxAPI.request(`/api/reports/shift-detail?${query.toString()}`, { method: 'GET' });
  reportState = result.data || { orders: [], summary: {} };
  renderReports();
};

// ============================================
// SHIFT REPORTS
// ============================================
const renderShifts = () => {
  // Kiểm tra elements tồn tại
  if (!shiftsTableBody || !totalShiftsValue || !totalShiftRevenueValue || !totalDifferenceValue) {
    console.warn('Shift elements not found, skipping renderShifts');
    return;
  }

  if (!shiftState || shiftState.length === 0) {
    shiftsTableBody.innerHTML = '<tr><td colspan="12" style="text-align: center; padding: 2rem;">Không có dữ liệu</td></tr>';
    totalShiftsValue.textContent = '0';
    totalShiftRevenueValue.textContent = formatCurrency(0);
    totalDifferenceValue.textContent = formatCurrency(0);
    return;
  }

  // Calculate totals
  const totalRevenue = shiftState.reduce((sum, shift) => sum + Number(shift.total_revenue || 0), 0);
  const totalDifference = shiftState.reduce((sum, shift) => sum + Number(shift.cash_difference || 0), 0);

  totalShiftsValue.textContent = String(shiftState.length);
  totalShiftRevenueValue.textContent = formatCurrency(totalRevenue);
  totalDifferenceValue.textContent = formatCurrency(Math.abs(totalDifference));
  
  // Set color for difference
  if (totalDifference > 0) {
    totalDifferenceValue.style.color = '#059669';
    totalDifferenceValue.textContent = '+' + formatCurrency(totalDifference);
  } else if (totalDifference < 0) {
    totalDifferenceValue.style.color = '#dc2626';
    totalDifferenceValue.textContent = '-' + formatCurrency(Math.abs(totalDifference));
  } else {
    totalDifferenceValue.style.color = '#6b7280';
  }

  // Render table
  shiftsTableBody.innerHTML = shiftState.map(shift => {
    const shiftDate = new Date(shift.shift_date).toLocaleDateString('vi-VN');
    const openedTime = shift.opened_at ? new Date(shift.opened_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';
    const closedTime = shift.closed_at ? new Date(shift.closed_at).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';

    const difference = shift.cash_difference || 0;
    let differenceClass = '';
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
        <td>${shift.employee_code}</td>
        <td>${shift.employee_name}</td>
        <td>${openedTime}</td>
        <td>${closedTime}</td>
        <td>${formatCurrency(shift.opening_cash)}</td>
        <td><strong>${formatCurrency(shift.total_revenue || 0)}</strong></td>
        <td>${formatCurrency(shift.expected_cash || 0)}</td>
        <td>${shift.closing_cash ? formatCurrency(shift.closing_cash) : '-'}</td>
        <td><span style="color: ${difference > 0 ? '#059669' : difference < 0 ? '#dc2626' : '#6b7280'}; font-weight: 700;">${differenceText}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn-view-detail" data-shift-id="${shift.id}" data-employee-code="${shift.employee_code}" data-opened-at="${shift.opened_at}" data-closed-at="${shift.closed_at || ''}" data-employee-name="${shift.employee_name}" data-difference="${difference}">
            👁️ Xem chi tiết
          </button>
        </td>
      </tr>
    `;
  }).join('');
};

const fetchShifts = async () => {
  try {
    // Kiểm tra elements tồn tại
    if (!shiftDateFilter || !shiftEmployeeFilter || !shiftStatusFilter) {
      console.warn('Shift filter elements not found, skipping fetchShifts');
      return;
    }

    const query = new URLSearchParams();
    
    if (shiftDateFilter.value) {
      query.set('date', shiftDateFilter.value);
    }
    
    if (shiftEmployeeFilter.value) {
      query.set('employee_code', shiftEmployeeFilter.value);
    }
    
    if (shiftStatusFilter.value) {
      query.set('status', shiftStatusFilter.value);
    }
    
    const queryString = query.toString();
    const url = queryString ? `/api/shifts/all?${queryString}` : '/api/shifts/all';
    
    const result = await CinoxAPI.request(url, { method: 'GET' });
    shiftState = result.data || [];
    renderShifts();
  } catch (error) {
    console.error('Lỗi fetch shifts:', error);
    shiftState = [];
    renderShifts();
  }
};

const renderCategoryOptions = () => {
  menuAdminCategory.innerHTML = categoryState
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
};

const fetchCategories = async () => {
  const result = await CinoxAPI.request("/api/categories", { method: "GET" });
  categoryState = result.data || [];
  renderCategoryOptions();
};

const renderMenuTable = () => {
  menuTableBody.innerHTML = menuState
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.category_name}</td>
          <td>${formatCurrency(item.price)}</td>
          <td><span class="status-badge ${item.is_available ? "active" : "hidden"}">${item.is_available ? "Đang bán" : "Đang ẩn"}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-action" type="button" data-edit-menu="${item.id}">Sửa</button>
              <button class="table-action" type="button" data-toggle-menu="${item.id}">${item.is_available ? "Ẩn món" : "Hiện món"}</button>
              <button class="table-action danger" type="button" data-delete-menu="${item.id}">Xóa</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
};

const fetchMenu = async () => {
  const result = await CinoxAPI.request("/api/products?include_unavailable=true", { method: "GET" });
  menuState = result.data || [];
  renderMenuTable();
};

const resetMenuForm = () => {
  menuAdminForm.reset();
  menuEditId.value = "";
  if (categoryState[0]) {
    menuAdminCategory.value = categoryState[0].id;
  }
  setFeedback(menuFormFeedback, "");
};

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.sectionTarget;
    sectionButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    Object.entries(sections).forEach(([key, section]) => {
      section.classList.toggle("is-active", key === target);
    });
  });
});

// Report tabs switching
reportTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.reportTab;
    
    // Toggle active state on buttons
    reportTabButtons.forEach((btn) => btn.classList.toggle("is-active", btn === button));
    
    // Toggle active state on content
    if (target === "shifts") {
      shiftsTabContent.classList.add("is-active");
      detailsTabContent.classList.remove("is-active");
    } else if (target === "details") {
      shiftsTabContent.classList.remove("is-active");
      detailsTabContent.classList.add("is-active");
    }
  });
});

// Shift detail modal handlers
closeShiftDetailModal.addEventListener("click", () => {
  shiftDetailModal.classList.remove("is-open");
});

shiftDetailModal.addEventListener("click", (e) => {
  if (e.target === shiftDetailModal) {
    shiftDetailModal.classList.remove("is-open");
  }
});

// View shift detail button click
shiftsTableBody.addEventListener("click", async (e) => {
  const viewButton = e.target.closest(".btn-view-detail");
  if (!viewButton) return;

  const shiftId = viewButton.dataset.shiftId;
  const employeeCode = viewButton.dataset.employeeCode;
  const employeeName = viewButton.dataset.employeeName;
  const openedAt = viewButton.dataset.openedAt;
  const closedAt = viewButton.dataset.closedAt;
  const difference = Number(viewButton.dataset.difference);

  // Update modal subtitle
  const shiftDate = new Date(openedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const openTime = new Date(openedAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const closeTime = closedAt ? new Date(closedAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Chưa đóng';

  shiftDetailSubtitle.textContent = `${employeeName} (${employeeCode}) - ${shiftDate} | ${openTime} - ${closeTime}`;

  // Fetch shift detail
  try {
    const query = new URLSearchParams({
      employee_code: employeeCode,
      start_time: openedAt,
      end_time: closedAt || new Date().toISOString()
    });

    const result = await CinoxAPI.request(`/api/reports/shift-detail?${query.toString()}`, { method: 'GET' });
    const { orders, summary } = result.data || { orders: [], summary: {} };

    // Update modal stats
    modalTotalOrders.textContent = String(summary.completed_orders || 0);
    modalTotalRevenue.textContent = formatCurrency(summary.total_revenue || 0);
    modalDifference.textContent = formatCurrency(Math.abs(difference));
    
    if (difference > 0) {
      modalDifference.style.color = '#059669';
      modalDifference.textContent = '+' + formatCurrency(difference);
    } else if (difference < 0) {
      modalDifference.style.color = '#dc2626';
      modalDifference.textContent = '-' + formatCurrency(Math.abs(difference));
    } else {
      modalDifference.style.color = '#6b7280';
    }

    // Render detail table
    const rows = [];
    orders.forEach(order => {
      const orderTime = new Date(order.created_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const statusText = {
        'COMPLETED': 'Hoàn thành',
        'PENDING': 'Đang xử lý',
        'CANCELLED': 'Đã hủy'
      }[order.status] || order.status;
      
      const statusClass = order.status.toLowerCase();

      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          const itemTotal = item.quantity * item.price;
          rows.push(`
            <tr>
              <td>${index === 0 ? orderTime : ''}</td>
              <td>${index === 0 ? order.id.substring(0, 8) : ''}</td>
              <td>${item.product_name}</td>
              <td style="text-align: center; font-weight: 700;">${item.quantity}</td>
              <td style="text-align: right;">${formatCurrency(item.price)}</td>
              <td style="text-align: right; font-weight: 700;">${formatCurrency(itemTotal)}</td>
              <td>${index === 0 ? `<span class="status-badge ${statusClass}">${statusText}</span>` : ''}</td>
            </tr>
          `);
        });
      } else {
        rows.push(`
          <tr>
            <td>${orderTime}</td>
            <td>${order.id.substring(0, 8)}</td>
            <td colspan="3" style="text-align: center; color: #9ca3af; font-style: italic;">Không có món</td>
            <td style="text-align: right; font-weight: 700;">${formatCurrency(order.total_amount)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          </tr>
        `);
      }
    });

    shiftDetailTableBody.innerHTML = rows.length > 0 ? rows.join('') : '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #9ca3af;">Không có dữ liệu</td></tr>';

    // Open modal
    shiftDetailModal.classList.add("is-open");

  } catch (error) {
    alert('Không thể tải chi tiết ca: ' + (error.message || 'Lỗi không xác định'));
  }
});

createUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await CinoxAPI.request("/api/employees", {
      method: "POST",
      body: JSON.stringify({
        full_name: newUserName.value.trim(),
        role: newUserRole.value
      })
    });

    createUserForm.reset();
    setFeedback(userFormFeedback, `✅ Đã tạo ${result.data.employee_code} với mật khẩu tạm: ${result.data.temporary_password}`, "success");
    await fetchEmployees();
  } catch (error) {
    setFeedback(userFormFeedback, error.message || "❌ Không thể tạo nhân viên.", "error");
  }
});

usersTableBody.addEventListener("click", async (event) => {
  const resetButton = event.target.closest("[data-reset-user]");
  const deleteButton = event.target.closest("[data-delete-user]");

  if (resetButton) {
    try {
      const employeeCode = resetButton.dataset.resetUser;
      const result = await CinoxAPI.request(`/api/employees/${employeeCode}/reset-password`, {
        method: "POST",
        body: JSON.stringify({})
      });
      setFeedback(userFormFeedback, `✅ Đã reset mật khẩu cho ${employeeCode}: ${result.data.temporary_password}`, "success");
    } catch (error) {
      setFeedback(userFormFeedback, error.message || "❌ Không thể reset mật khẩu.", "error");
    }
    return;
  }

  if (deleteButton) {
    const employeeCode = deleteButton.dataset.deleteUser;
    const employee = employeeState.find(e => e.employee_code === employeeCode);
    
    if (!employee) return;

    const confirmed = confirm(
      `⚠️ Xác nhận xóa nhân viên?\n\n` +
      `Mã NV: ${employeeCode}\n` +
      `Họ tên: ${employee.full_name}\n` +
      `Vai trò: ${employee.role}\n\n` +
      `Hành động này KHÔNG THỂ hoàn tác!`
    );

    if (!confirmed) return;

    try {
      await CinoxAPI.request(`/api/employees/${employeeCode}`, {
        method: "DELETE"
      });
      setFeedback(userFormFeedback, `✅ Đã xóa nhân viên ${employeeCode}`, "success");
      await fetchEmployees();
    } catch (error) {
      setFeedback(userFormFeedback, error.message || "❌ Không thể xóa nhân viên.", "error");
    }
  }
});

reportDateFilter.addEventListener("change", fetchReports);
reportEmployeeFilter.addEventListener("change", fetchReports);
document.getElementById('reportPeriodFilter')?.addEventListener('change', fetchReports);

resetReportFilters.addEventListener("click", async () => {
  reportDateFilter.value = "";
  reportEmployeeFilter.value = "";
  const periodFilter = document.getElementById('reportPeriodFilter');
  if (periodFilter) periodFilter.value = "day";
  await fetchReports();
});

// Shift Reports Event Listeners
shiftDateFilter.addEventListener("change", fetchShifts);
shiftEmployeeFilter.addEventListener("change", fetchShifts);
shiftStatusFilter.addEventListener("change", fetchShifts);

resetShiftFilters.addEventListener("click", async () => {
  shiftDateFilter.value = "";
  shiftEmployeeFilter.value = "";
  shiftStatusFilter.value = "";
  await fetchShifts();
});

menuAdminForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: menuAdminName.value.trim(),
    category_id: menuAdminCategory.value,
    image_url: menuAdminImageUrl.value.trim(),
    price: Number(menuAdminPrice.value),
    is_available: true
  };

  try {
    if (menuEditId.value) {
      await CinoxAPI.request(`/api/products/${menuEditId.value}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setFeedback(menuFormFeedback, "✅ Đã cập nhật món ăn.", "success");
    } else {
      await CinoxAPI.request("/api/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setFeedback(menuFormFeedback, "✅ Đã thêm món mới vào database.", "success");
    }

    resetMenuForm();
    await fetchMenu();
  } catch (error) {
    setFeedback(menuFormFeedback, error.message || "❌ Không thể lưu món ăn.", "error");
  }
});

clearMenuForm.addEventListener("click", resetMenuForm);

menuTableBody.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-menu]");
  const toggleButton = event.target.closest("[data-toggle-menu]");
  const deleteButton = event.target.closest("[data-delete-menu]");

  if (editButton) {
    const item = menuState.find((entry) => entry.id === editButton.dataset.editMenu);
    if (!item) return;

    menuEditId.value = item.id;
    menuAdminName.value = item.name;
    menuAdminCategory.value = item.category_id || "";
    menuAdminImageUrl.value = item.image_url || "";
    menuAdminPrice.value = item.price;
    setFeedback(menuFormFeedback, "📝 Đang chỉnh sửa món đã chọn.", "success");
    return;
  }

  if (toggleButton) {
    try {
      const item = menuState.find((entry) => entry.id === toggleButton.dataset.toggleMenu);
      if (!item) return;

      await CinoxAPI.request(`/api/products/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_available: !item.is_available })
      });
      await fetchMenu();
      setFeedback(menuFormFeedback, item.is_available ? "✅ Đã ẩn món khỏi POS." : "✅ Đã hiện món trên POS.", "success");
    } catch (error) {
      setFeedback(menuFormFeedback, error.message || "❌ Không thể đổi trạng thái món.", "error");
    }
    return;
  }

  if (deleteButton) {
    try {
      await CinoxAPI.request(`/api/products/${deleteButton.dataset.deleteMenu}`, {
        method: "DELETE"
      });
      resetMenuForm();
      await fetchMenu();
      setFeedback(menuFormFeedback, "✅ Đã xóa món khỏi database.", "success");
    } catch (error) {
      setFeedback(menuFormFeedback, error.message || "❌ Không thể xóa món.", "error");
    }
  }
});

logoutButton.addEventListener("click", () => {
  CinoxAPI.clearSession();
  window.location.replace("./index.html");
});

openPosButton.addEventListener("click", () => {
  window.open("./pos.html?preview=1", "_blank", "noopener");
});

openKdsButton.addEventListener("click", () => {
  window.open("./kds.html", "_blank", "noopener");
});

const initAdminPanel = async () => {
  renderAdminHeader();
  await Promise.all([renderDashboard(), fetchEmployees(), fetchReports(), fetchShifts(), fetchCategories(), fetchMenu()]);
  resetMenuForm();
};

initAdminPanel().catch((error) => {
  console.error("Lỗi khởi tạo admin panel:", error);
  setFeedback(userFormFeedback, error.message || "❌ Không thể tải dữ liệu admin.", "error");
  setFeedback(menuFormFeedback, error.message || "❌ Không thể tải dữ liệu admin.", "error");
});
