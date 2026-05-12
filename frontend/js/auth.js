const loginForm = document.getElementById("loginForm");
const employeeCodeInput = document.getElementById("employeeCode");
const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("togglePassword");
const submitButton = document.getElementById("submitButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const apiStatus = document.getElementById("apiStatus");
const systemClock = document.getElementById("systemClock");
const apiEndpoint = document.getElementById("apiEndpoint");
const rememberSessionCheckbox = document.getElementById("rememberSession");

const getTargetRoute = (user) => {
  if (CinoxAPI.isAdminUser(user)) {
    return "./admin.html";
  } else if (user.role === "KITCHEN") {
    return "./kds.html";
  } else {
    return "./pos.html";
  }
};

const setFeedback = (message, type = "") => {
  feedbackMessage.textContent = message;
  feedbackMessage.className = "feedback";
  if (type) {
    feedbackMessage.classList.add(`is-${type}`);
  }
};

const setSubmitting = (isSubmitting) => {
  submitButton.disabled = isSubmitting;
  submitButton.querySelector("span").textContent = isSubmitting ? "Đang xác thực..." : "Đăng nhập hệ thống";
};

const setApiStatus = (message, status = "idle") => {
  apiStatus.textContent = message;
  apiStatus.dataset.status = status;
};

const updateClock = () => {
  systemClock.textContent = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
};

const pingApi = async () => {
  setApiStatus("Đang kiểm tra kết nối...", "checking");

  try {
    const result = await CinoxAPI.request("/api/health", { method: "GET" });
    setApiStatus(result?.success ? "Hệ thống đã sẵn sàng" : "Hệ thống phản hồi", "ok");
  } catch (error) {
    setApiStatus("Hệ thống chưa kết nối", "error");
  }
};

apiEndpoint.textContent = `${CinoxAPI.API_BASE_URL}/api/auth/login`;

togglePasswordButton.addEventListener("click", () => {
  const nextType = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = nextType;
  togglePasswordButton.textContent = nextType === "password" ? "Hien" : "An";
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("");

  const employee_code = employeeCodeInput.value.trim();
  const password = passwordInput.value;

  if (!employee_code || !password) {
    setFeedback("Vui lòng nhập đầy đủ mã nhân viên và mật khẩu.", "error");
    return;
  }

  setSubmitting(true);

  try {
    const result = await CinoxAPI.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ employee_code, password })
    });

    CinoxAPI.saveSession(result.token, result.user, rememberSessionCheckbox.checked);
    setFeedback(`✅ Xin chào ${result.user.full_name}. Đăng nhập thành công!`, "success");
    window.setTimeout(() => {
      window.location.href = getTargetRoute(result.user);
    }, 400);
  } catch (error) {
    setFeedback(error.message || "❌ Không thể đăng nhập vào hệ thống.", "error");
  } finally {
    setSubmitting(false);
  }
});

const existingSession = CinoxAPI.getSession();
if (existingSession) {
  window.location.replace(getTargetRoute(existingSession.user));
}

updateClock();
setInterval(updateClock, 1000);
pingApi();
