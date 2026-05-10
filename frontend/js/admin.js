const sectionButtons = document.querySelectorAll("[data-section-target]");
const sections = {
  dashboard: document.getElementById("dashboardSection"),
  users: document.getElementById("usersSection"),
  reports: document.getElementById("reportsSection"),
  menu: document.getElementById("menuSection")
};

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
const cancelledOrdersValue = document.getElementById("cancelledOrdersValue");
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
    cancelledOrdersValue.textContent = String(summary.data.cancelled_orders);

    const totalCount = Math.max(summary.data.completed_orders + summary.data.cancelled_orders, 1);
    const completedPercent = Math.round((summary.data.completed_orders / totalCount) * 100);
    statusDonut.style.background = `conic-gradient(
      var(--success) 0 ${completedPercent}%,
      var(--danger) ${completedPercent}% 100%
    )`;
    statusDonut.dataset.label = `${completedPercent}%`;
  } catch (error) {
    dailyRevenueValue.textContent = formatCurrency(0);
    completedOrdersValue.textContent = "0";
    cancelledOrdersValue.textContent = "0";
    statusDonut.style.background = "conic-gradient(var(--danger) 0 100%)";
    statusDonut.dataset.label = "0%";
  }
};

const renderUsers = () => {
  usersTableBody.innerHTML = employeeState
    .filter((employee) => employee.employee_code !== "ADMIN")
    .map(
      (employee) => `
        <tr>
          <td>${employee.employee_code}</td>
          <td>${employee.full_name}</td>
          <td>${employee.role}</td>
          <td>${employee.is_active ? "Dang hoat dong" : "Da khoa"}</td>
          <td>
            <div class="table-actions">
              <button class="table-action" type="button" data-reset-user="${employee.employee_code}">Reset mat khau</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  reportEmployeeFilter.innerHTML = `
    <option value="">Tat ca nhan vien</option>
    ${employeeState
      .filter((employee) => employee.employee_code !== "ADMIN")
      .map((employee) => `<option value="${employee.employee_code}">${employee.employee_code}</option>`)
      .join("")}
  `;
};

const fetchEmployees = async () => {
  const result = await CinoxAPI.request("/api/employees", { method: "GET" });
  employeeState = result.data || [];
  renderUsers();
};

const renderReports = () => {
  const selectedEmployee = reportEmployeeFilter.value;
  filteredRevenueValue.textContent = formatCurrency(
    reportState
      .filter((report) => report.status === "completed")
      .reduce((sum, report) => sum + Number(report.total_amount || 0), 0)
  );
  filteredOrdersValue.textContent = String(reportState.length);
  filteredEmployeeValue.textContent = selectedEmployee || "Tat ca";

  reportsTableBody.innerHTML = reportState
    .map(
      (report) => `
        <tr>
          <td>${report.order_code || report.id}</td>
          <td>${new Date(report.created_at).toLocaleDateString("vi-VN")}</td>
          <td>${report.employee_code}</td>
          <td>${report.full_name}</td>
          <td><span class="status-badge ${report.status}">${report.status === "completed" ? "Hoan thanh" : "Bi huy"}</span></td>
          <td>${formatCurrency(report.total_amount)}</td>
        </tr>
      `
    )
    .join("");

  renderShiftChart();
};

const fetchReports = async () => {
  const query = new URLSearchParams();
  if (reportDateFilter.value) query.set("date", reportDateFilter.value);
  if (reportEmployeeFilter.value) query.set("employee_code", reportEmployeeFilter.value);
  const result = await CinoxAPI.request(`/api/reports/sales?${query.toString()}`, { method: "GET" });
  reportState = result.data || [];
  renderReports();
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
          <td><span class="status-badge ${item.is_available ? "active" : "hidden"}">${item.is_available ? "Dang ban" : "Dang an"}</span></td>
          <td>
            <div class="table-actions">
              <button class="table-action" type="button" data-edit-menu="${item.id}">Sua</button>
              <button class="table-action" type="button" data-toggle-menu="${item.id}">${item.is_available ? "An mon" : "Hien mon"}</button>
              <button class="table-action danger" type="button" data-delete-menu="${item.id}">Xoa</button>
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
    setFeedback(userFormFeedback, `Da tao ${result.data.employee_code} voi mat khau tam ${result.data.temporary_password}.`, "success");
    await fetchEmployees();
  } catch (error) {
    setFeedback(userFormFeedback, error.message || "Khong the tao nhan vien.", "error");
  }
});

usersTableBody.addEventListener("click", async (event) => {
  const resetButton = event.target.closest("[data-reset-user]");
  if (!resetButton) return;

  try {
    const employeeCode = resetButton.dataset.resetUser;
    const result = await CinoxAPI.request(`/api/employees/${employeeCode}/reset-password`, {
      method: "POST",
      body: JSON.stringify({})
    });
    setFeedback(userFormFeedback, `Da reset mat khau cho ${employeeCode}: ${result.data.temporary_password}`, "success");
  } catch (error) {
    setFeedback(userFormFeedback, error.message || "Khong the reset mat khau.", "error");
  }
});

reportDateFilter.addEventListener("change", fetchReports);
reportEmployeeFilter.addEventListener("change", fetchReports);
resetReportFilters.addEventListener("click", async () => {
  reportDateFilter.value = "";
  reportEmployeeFilter.value = "";
  await fetchReports();
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
      setFeedback(menuFormFeedback, "Da cap nhat mon an.", "success");
    } else {
      await CinoxAPI.request("/api/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setFeedback(menuFormFeedback, "Da them mon moi vao database.", "success");
    }

    resetMenuForm();
    await fetchMenu();
  } catch (error) {
    setFeedback(menuFormFeedback, error.message || "Khong the luu mon an.", "error");
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
    setFeedback(menuFormFeedback, "Dang chinh sua mon da chon.", "success");
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
      setFeedback(menuFormFeedback, item.is_available ? "Da an mon khoi POS." : "Da hien mon tren POS.", "success");
    } catch (error) {
      setFeedback(menuFormFeedback, error.message || "Khong the doi trang thai mon.", "error");
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
      setFeedback(menuFormFeedback, "Da xoa mon khoi database.", "success");
    } catch (error) {
      setFeedback(menuFormFeedback, error.message || "Khong the xoa mon.", "error");
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
  await Promise.all([renderDashboard(), fetchEmployees(), fetchReports(), fetchCategories(), fetchMenu()]);
  resetMenuForm();
};

initAdminPanel().catch((error) => {
  setFeedback(userFormFeedback, error.message || "Khong the tai du lieu admin.", "error");
  setFeedback(menuFormFeedback, error.message || "Khong the tai du lieu admin.", "error");
});
