const kdsSession = CinoxAPI.requireSession();
if (kdsSession && !CinoxAPI.isAdminUser(kdsSession.user)) {
  window.location.replace("./pos.html");
}

const kdsClock = document.getElementById("kdsClock");
const backToAdminButton = document.getElementById("backToAdminButton");
const pendingOrdersCount = document.getElementById("pendingOrdersCount");
const preparingOrdersCount = document.getElementById("preparingOrdersCount");
const readyOrdersCount = document.getElementById("readyOrdersCount");
const kdsBoard = document.getElementById("kdsBoard");

let kitchenOrders = [];

const updateClock = () => {
  kdsClock.textContent = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
};

const renderSummary = () => {
  pendingOrdersCount.textContent = String(kitchenOrders.filter((order) => order.status === "pending").length);
  preparingOrdersCount.textContent = String(kitchenOrders.filter((order) => order.status === "preparing").length);
  readyOrdersCount.textContent = String(kitchenOrders.filter((order) => order.status === "ready").length);
};

const renderBoard = () => {
  if (kitchenOrders.length === 0) {
    kdsBoard.innerHTML = `
      <article class="order-card">
        <div class="order-head">
          <strong class="order-id">Chua co don bep</strong>
        </div>
        <div class="order-footer">
          <span>He thong dang cho du lieu tu database</span>
        </div>
      </article>
    `;
    return;
  }

  kdsBoard.innerHTML = kitchenOrders
    .map(
      (order) => `
        <article class="order-card">
          <div class="order-head">
            <strong class="order-id">${order.order_code || order.id}</strong>
            <span class="order-badge ${order.status}">${order.status}</span>
          </div>
          <div class="order-meta">
            <span>${order.counter_no || "Quay POS"}</span>
            <span>${new Date(order.created_at).toLocaleTimeString("vi-VN")}</span>
          </div>
          <div class="order-items">
            ${(order.items || [])
              .map(
                (item) => `
                  <div class="order-item-line">
                    <span>${item.name}</span>
                    <strong>x${item.quantity}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="order-footer">
            <span>Trang thai bep</span>
            <strong>${order.status.toUpperCase()}</strong>
          </div>
        </article>
      `
    )
    .join("");
};

const fetchKitchenOrders = async () => {
  try {
    const result = await CinoxAPI.request("/api/kds/orders", { method: "GET" });
    kitchenOrders = result.data || [];
  } catch (error) {
    kitchenOrders = [];
  }

  renderSummary();
  renderBoard();
};

backToAdminButton.addEventListener("click", () => {
  window.location.href = "./admin.html";
});

updateClock();
setInterval(updateClock, 1000);
fetchKitchenOrders();
setInterval(fetchKitchenOrders, 15000);
