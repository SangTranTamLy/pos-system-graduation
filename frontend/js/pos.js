const TAX_RATE = 0.08;

const session = CinoxAPI.requireSession();
const isAdmin = CinoxAPI.isAdminUser(session?.user);
const allowAdminPreview = new URLSearchParams(window.location.search).get("preview") === "1";
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

let categories = [{ id: "all", name: "Tat ca", icon: "◎" }];
let activeCategory = "all";
let searchQuery = "";
let orderState = [];
let menuState = [];

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

checkoutButton.addEventListener("click", () => {
  if (orderState.length === 0) {
    window.alert("Don hang dang trong. Hay them mon truoc khi thanh toan.");
    return;
  }

  window.alert("API tao don hang that se duoc noi tiep o buoc sau.");
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
